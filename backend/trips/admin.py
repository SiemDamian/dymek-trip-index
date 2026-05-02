from django.contrib import admin
from .models import TripType, Trip, TripParticipant


@admin.register(TripType)
class TripTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")
    search_fields = ("name",)
    list_filter = ("is_active",)


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ("title", "location", "start_date", "end_date", "status", "trip_type", "created_by")
    search_fields = ("title", "location")
    list_filter = ("status", "trip_type", "start_date")
    autocomplete_fields = ("trip_type", "created_by")


@admin.register(TripParticipant)
class TripParticipantAdmin(admin.ModelAdmin):
    list_display = ("trip", "user", "attendance_status", "added_by", "joined_at")
    search_fields = ("trip__title", "user__username", "user__display_name")
    list_filter = ("attendance_status", "trip")
    autocomplete_fields = ("trip", "user", "added_by")