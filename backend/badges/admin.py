from django.contrib import admin
from django.utils.html import format_html

from .models import Badge, UserBadge


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "image_preview",
        "badge_type",
        "trigger_type",
        "trigger_value",
        "is_active",
    )
    search_fields = ("name", "description")
    list_filter = ("badge_type", "trigger_type", "is_active")
    ordering = ("name",)
    readonly_fields = ("image_preview",)

    fieldsets = (
        ("Podstawowe informacje", {
            "fields": ("name", "description", "image", "image_preview")
        }),
        ("Typ i warunki", {
            "fields": ("badge_type", "trigger_type", "trigger_value", "is_active")
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height: 60px; width: 60px; object-fit: contain;" />',
                obj.image.url,
            )
        return "Brak obrazka"

    image_preview.short_description = "Podgląd"


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "badge",
        "badge_image_preview",
        "awarded_at",
        "awarded_by",
    )
    search_fields = (
        "user__username",
        "user__display_name",
        "badge__name",
    )
    list_filter = ("badge", "awarded_at")
    autocomplete_fields = ("user", "badge", "awarded_by")
    ordering = ("-awarded_at",)

    def badge_image_preview(self, obj):
        if obj.badge and obj.badge.image:
            return format_html(
                '<img src="{}" style="height: 40px; width: 40px; object-fit: contain;" />',
                obj.badge.image.url,
            )
        return "Brak obrazka"

    badge_image_preview.short_description = "Obrazek"