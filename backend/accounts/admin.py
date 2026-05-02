from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("username", "display_name", "is_staff", "is_active")
    search_fields = ("username", "display_name")
    ordering = ("username",)

    fieldsets = UserAdmin.fieldsets + (
        ("Dodatkowe informacje", {"fields": ("display_name",)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Dodatkowe informacje", {"fields": ("display_name",)}),
    )