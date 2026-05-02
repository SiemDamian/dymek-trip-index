from django.urls import path

from rankings.views import (
    RankingListView,
    RankListView,
    RecalculateStatsView,
)


urlpatterns = [
    path("", RankingListView.as_view(), name="ranking-list"),
    path("ranks/", RankListView.as_view(), name="rank-list"),
    path("recalculate/", RecalculateStatsView.as_view(), name="ranking-recalculate"),
]