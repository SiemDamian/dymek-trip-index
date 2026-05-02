from django.conf import settings
from django.db import models


class TripType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Typ wyjazdu"
        verbose_name_plural = "Typy wyjazdów"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Trip(models.Model):
    STATUS_PLANNED = "planned"
    STATUS_FINISHED = "finished"
    STATUS_CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (STATUS_PLANNED, "Planowany"),
        (STATUS_FINISHED, "Zakończony"),
        (STATUS_CANCELLED, "Anulowany"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PLANNED)
    trip_type = models.ForeignKey(
        TripType,
        on_delete=models.PROTECT,
        related_name="trips",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_trips",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Wyjazd"
        verbose_name_plural = "Wyjazdy"
        ordering = ["-start_date", "-id"]

    def __str__(self):
        return self.title


class TripParticipant(models.Model):
    ATTENDANCE_PRESENT = "present"
    ATTENDANCE_ABSENT = "absent"
    ATTENDANCE_MAYBE = "maybe"

    ATTENDANCE_CHOICES = [
        (ATTENDANCE_PRESENT, "Był"),
        (ATTENDANCE_ABSENT, "Nie był"),
        (ATTENDANCE_MAYBE, "Może"),
    ]

    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE,
        related_name="participants",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trip_participations",
    )
    attendance_status = models.CharField(
        max_length=20,
        choices=ATTENDANCE_CHOICES,
        default=ATTENDANCE_PRESENT,
    )
    notes = models.TextField(blank=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="added_trip_participants",
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Uczestnik wyjazdu"
        verbose_name_plural = "Uczestnicy wyjazdów"
        unique_together = ("trip", "user")
        ordering = ["trip", "user"]

    def __str__(self):
        return f"{self.user} - {self.trip}"