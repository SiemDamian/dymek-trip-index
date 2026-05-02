from django.conf import settings
from django.db import models


class Rank(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    min_score = models.IntegerField()
    max_score = models.IntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Ranga"
        verbose_name_plural = "Rangi"
        ordering = ["min_score"]

    def __str__(self):
        return f"{self.name} ({self.min_score}-{self.max_score})"


class UserStat(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stats",
    )
    attendance_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    total_trips = models.PositiveIntegerField(default=0)
    recent_trips = models.PositiveIntegerField(default=0)

    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    streak_score = models.PositiveIntegerField(default=0)

    diversity_score = models.PositiveIntegerField(default=0)
    loyalty_score = models.PositiveIntegerField(default=0)
    bonus_score = models.PositiveIntegerField(default=0)
    total_score = models.PositiveIntegerField(default=0)

    current_rank = models.ForeignKey(
        Rank,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_stats",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Statystyka użytkownika"
        verbose_name_plural = "Statystyki użytkowników"
        ordering = ["-total_score", "user__username"]

    def __str__(self):
        return f"{self.user} - {self.total_score} pkt"