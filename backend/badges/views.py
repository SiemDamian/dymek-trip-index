from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from badges.models import Badge, UserBadge
from badges.serializers import (
    AwardBadgeSerializer,
    BadgeSerializer,
    UserBadgeSerializer,
)
from badges.services import award_badge_to_user


User = get_user_model()


class BadgeListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BadgeSerializer

    def get_queryset(self):
        return Badge.objects.filter(is_active=True).order_by("name")

    def get_serializer_context(self):
        return {"request": self.request}


class MyBadgesView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserBadgeSerializer

    def get_queryset(self):
        return (
            UserBadge.objects.select_related("user", "badge", "awarded_by")
            .filter(user=self.request.user)
            .order_by("-awarded_at")
        )

    def get_serializer_context(self):
        return {"request": self.request}


class UserBadgesView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserBadgeSerializer

    def get_queryset(self):
        user_id = self.kwargs["user_id"]

        return (
            UserBadge.objects.select_related("user", "badge", "awarded_by")
            .filter(user_id=user_id)
            .order_by("-awarded_at")
        )

    def get_serializer_context(self):
        return {"request": self.request}


class AwardBadgeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Brak uprawnień do przyznawania odznak."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AwardBadgeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(id=serializer.validated_data["user_id"])
        except User.DoesNotExist:
            return Response(
                {"detail": "Użytkownik nie istnieje."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            badge = Badge.objects.get(id=serializer.validated_data["badge_id"])
        except Badge.DoesNotExist:
            return Response(
                {"detail": "Odznaka nie istnieje."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user_badge, created = award_badge_to_user(
            user=user,
            badge=badge,
            awarded_by=request.user,
            reason=serializer.validated_data.get("reason", ""),
        )

        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK

        return Response(
            {
                "detail": "Odznaka została przyznana." if created else "Użytkownik już ma tę odznakę.",
                "created": created,
                "user_badge": UserBadgeSerializer(
                    user_badge,
                    context={"request": request},
                ).data,
            },
            status=response_status,
        )