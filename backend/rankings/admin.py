from django.contrib import admin, messages

from rankings.models import Rank, UserStat
from rankings.services import recalculate_all_user_stats


@admin.register(Rank)
class RankAdmin(admin.ModelAdmin):
    list_display = ("name", "min_score", "max_score", "is_active")
    search_fields = ("name",)
    list_filter = ("is_active",)
    ordering = ("min_score",)


@admin.register(UserStat)
class UserStatAdmin(admin.ModelAdmin):
    list_display = (
        "user",
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
        "updated_at",
    )
    search_fields = ("user__username", "user__display_name")
    list_filter = ("current_rank", "updated_at")
    autocomplete_fields = ("user", "current_rank")
    ordering = ("-total_score",)
    actions = ["recalculate_all_stats_action"]

    @admin.action(description="Przelicz statystyki wszystkich użytkowników")
    def recalculate_all_stats_action(self, request, queryset):
        results = recalculate_all_user_stats()

        self.message_user(
            request,
            f"Przeliczono statystyki dla {len(results)} użytkowników.",
            level=messages.SUCCESS,
        )