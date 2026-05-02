from rest_framework import serializers
from django.contrib.auth import get_user_model


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    rank_name = serializers.SerializerMethodField()
    total_score = serializers.SerializerMethodField()
    attendance_percent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "display_name",
            "is_staff",
            "is_active",
            "rank_name",
            "total_score",
            "attendance_percent",
        ]

    def get_rank_name(self, obj):
        if hasattr(obj, "stats") and obj.stats.current_rank:
            return obj.stats.current_rank.name
        return None

    def get_total_score(self, obj):
        if hasattr(obj, "stats"):
            return obj.stats.total_score
        return 0

    def get_attendance_percent(self, obj):
        if hasattr(obj, "stats"):
            return obj.stats.attendance_percent
        return 0


class CurrentUserSerializer(serializers.ModelSerializer):
    stats = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "display_name",
            "is_staff",
            "is_active",
            "stats",
            "badges",
        ]

    def get_stats(self, obj):
        if not hasattr(obj, "stats"):
            return None

        stats = obj.stats

        return {
            "attendance_percent": stats.attendance_percent,
            "total_trips": stats.total_trips,
            "recent_trips": stats.recent_trips,
            "current_streak": stats.current_streak,
            "longest_streak": stats.longest_streak,
            "streak_score": stats.streak_score,
            "diversity_score": stats.diversity_score,
            "loyalty_score": stats.loyalty_score,
            "bonus_score": stats.bonus_score,
            "total_score": stats.total_score,
            "current_rank": stats.current_rank.name if stats.current_rank else None,
            "current_rank_description": stats.current_rank.description if stats.current_rank else None,
        }

    def get_badges(self, obj):
        user_badges = obj.badges.select_related("badge").all()

        return [
            {
                "id": user_badge.badge.id,
                "name": user_badge.badge.name,
                "description": user_badge.badge.description,
                "image": (
                    self.context["request"].build_absolute_uri(user_badge.badge.image.url)
                    if user_badge.badge.image
                    else None
                ),
                "awarded_at": user_badge.awarded_at,
                "reason": user_badge.reason,
            }
            for user_badge in user_badges
        ]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)