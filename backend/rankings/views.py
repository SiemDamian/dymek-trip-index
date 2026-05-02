from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rankings.models import Rank
from rankings.serializers import RankSerializer, UserStatSerializer
from rankings.services import get_ranking_queryset, recalculate_all_user_stats


class RankingListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserStatSerializer

    def get_queryset(self):
        return get_ranking_queryset()


class RankListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RankSerializer

    def get_queryset(self):
        return Rank.objects.filter(is_active=True).order_by("min_score")


class RecalculateStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Brak uprawnień do przeliczania statystyk."},
                status=403,
            )

        results = recalculate_all_user_stats()

        return Response(
            {
                "detail": "Statystyki przeliczone pomyślnie.",
                "users_count": len(results),
            }
        )