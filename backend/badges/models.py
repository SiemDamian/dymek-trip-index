from django.conf import settings
from django.db import models


class Badge(models.Model):
    BADGE_TYPE_AUTOMATIC = "automatic"
    BADGE_TYPE_MANUAL = "manual"
    BADGE_TYPE_SEASONAL = "seasonal"
    BADGE_TYPE_SPECIAL = "special"

    BADGE_TYPE_CHOICES = [
        (BADGE_TYPE_AUTOMATIC, "Automatyczna"),
        (BADGE_TYPE_MANUAL, "Ręczna"),
        (BADGE_TYPE_SEASONAL, "Sezonowa"),
        (BADGE_TYPE_SPECIAL, "Specjalna"),
    ]

    TRIGGER_TYPE_TRIPS_COUNT = "trips_count"
    TRIGGER_TYPE_ATTENDANCE_PERCENT = "attendance_percent"
    TRIGGER_TYPE_CONSECUTIVE_TRIPS = "consecutive_trips"
    TRIGGER_TYPE_SCORE = "score"
    TRIGGER_TYPE_MANUAL = "manual"

    TRIGGER_TYPE_CHOICES = [
        (TRIGGER_TYPE_TRIPS_COUNT, "Liczba wyjazdów"),
        (TRIGGER_TYPE_ATTENDANCE_PERCENT, "Procent obecności"),
        (TRIGGER_TYPE_CONSECUTIVE_TRIPS, "Kolejne wyjazdy"),
        (TRIGGER_TYPE_SCORE, "Wynik punktowy"),
        (TRIGGER_TYPE_MANUAL, "Ręczne przyznanie"),
    ]

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    image = models.ImageField(
        upload_to="badges/",
        blank=True,
        null=True,
        help_text="Obrazek odznaki, najlepiej PNG, JPG albo WEBP.",
    )

    badge_type = models.CharField(
        max_length=20,
        choices=BADGE_TYPE_CHOICES,
        default=BADGE_TYPE_AUTOMATIC,
    )
    trigger_type = models.CharField(
        max_length=30,
        choices=TRIGGER_TYPE_CHOICES,
        default=TRIGGER_TYPE_MANUAL,
    )
    trigger_value = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Wartość progu dla automatycznego przyznawania odznaki.",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Odznaka"
        verbose_name_plural = "Odznaki"
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="badges",
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name="user_badges",
    )
    awarded_at = models.DateTimeField(auto_now_add=True)
    awarded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="awarded_badges",
    )
    reason = models.TextField(blank=True)

    class Meta:
        verbose_name = "Odznaka użytkownika"
        verbose_name_plural = "Odznaki użytkowników"
        unique_together = ("user", "badge")
        ordering = ["-awarded_at"]

    def __str__(self):
        return f"{self.user} - {self.badge}"