from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rankings.services import recalculate_all_user_stats
from trips.models import Trip, TripType, TripParticipant
from trips.serializers import (
    AddTripParticipantSerializer,
    TripDetailSerializer,
    TripListSerializer,
    TripParticipantSerializer,
    TripTypeSerializer,
)


User = get_user_model()


class TripTypeListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TripTypeSerializer

    def get_queryset(self):
        return TripType.objects.filter(is_active=True).order_by("name")


class TripListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Trip.objects.select_related("trip_type", "created_by")
            .prefetch_related("participants", "participants__user")
            .all()
            .order_by("-start_date", "-id")
        )

        status_value = self.request.query_params.get("status")
        trip_type_id = self.request.query_params.get("trip_type")

        if status_value:
            queryset = queryset.filter(status=status_value)

        if trip_type_id:
            queryset = queryset.filter(trip_type_id=trip_type_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TripListSerializer
        return TripDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TripDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TripDetailSerializer

    def get_queryset(self):
        return (
            Trip.objects.select_related("trip_type", "created_by")
            .prefetch_related("participants", "participants__user", "participants__added_by")
            .all()
        )

    def perform_update(self, serializer):
        serializer.save()
        recalculate_all_user_stats()

    def perform_destroy(self, instance):
        instance.delete()
        recalculate_all_user_stats()


class TripParticipantListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TripParticipantSerializer

    def get_queryset(self):
        trip_id = self.kwargs["trip_id"]

        return (
            TripParticipant.objects.select_related("trip", "user", "added_by")
            .filter(trip_id=trip_id)
            .order_by("user__display_name", "user__username")
        )


class AddTripParticipantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        serializer = AddTripParticipantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            return Response(
                {"detail": "Wyjazd nie istnieje."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            user = User.objects.get(id=serializer.validated_data["user_id"])
        except User.DoesNotExist:
            return Response(
                {"detail": "Użytkownik nie istnieje."},
                status=status.HTTP_404_NOT_FOUND,
            )

        participant, created = TripParticipant.objects.update_or_create(
            trip=trip,
            user=user,
            defaults={
                "attendance_status": serializer.validated_data["attendance_status"],
                "notes": serializer.validated_data.get("notes", ""),
                "added_by": request.user,
            },
        )

        recalculate_all_user_stats()

        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK

        return Response(
            TripParticipantSerializer(participant).data,
            status=response_status,
        )


class RemoveTripParticipantView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, trip_id, participant_id):
        try:
            participant = TripParticipant.objects.get(
                id=participant_id,
                trip_id=trip_id,
            )
        except TripParticipant.DoesNotExist:
            return Response(
                {"detail": "Uczestnik wyjazdu nie istnieje."},
                status=status.HTTP_404_NOT_FOUND,
            )

        participant.delete()
        recalculate_all_user_stats()

        return Response(status=status.HTTP_204_NO_CONTENT)