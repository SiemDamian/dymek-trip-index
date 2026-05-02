from rest_framework import serializers

from rankings.models import Rank, UserStat


class RankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rank
        fields = [
            "id",
            "name",
            "min_score",
            "max_score",
            "description",
            "is_active",
        ]


class UserStatSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    display_name = serializers.CharField(source="user.display_name", read_only=True)
    rank_name = serializers.CharField(source="current_rank.name", read_only=True)

    class Meta:
        model = UserStat
        fields = [
            "id",
            "user_id",
            "username",
            "display_name",
            "attendance_percent",
            "total_trips",
            "recent_trips",
            "current_streak",
            "longest_streak",
            "streak_score",
            "diversity_score",
            "loyalty_score",
            "bonus_score",
            "total_score",
            "current_rank",
            "rank_name",
            "updated_at",
        ]