from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from badges.services import award_automatic_badges_for_user
from rankings.models import Rank, UserStat
from trips.models import Trip, TripParticipant


def calculate_attendance_percent(user):
    finished_trips_count = Trip.objects.filter(
        status=Trip.STATUS_FINISHED
    ).count()

    if finished_trips_count == 0:
        return 0

    user_finished_trips_count = TripParticipant.objects.filter(
        user=user,
        trip__status=Trip.STATUS_FINISHED,
        attendance_status=TripParticipant.ATTENDANCE_PRESENT,
    ).count()

    return round((user_finished_trips_count / finished_trips_count) * 100, 2)


def calculate_total_trips(user):
    return TripParticipant.objects.filter(
        user=user,
        trip__status=Trip.STATUS_FINISHED,
        attendance_status=TripParticipant.ATTENDANCE_PRESENT,
    ).count()


def calculate_recent_trips(user):
    one_year_ago = timezone.now().date() - timedelta(days=365)

    return TripParticipant.objects.filter(
        user=user,
        trip__status=Trip.STATUS_FINISHED,
        trip__start_date__gte=one_year_ago,
        attendance_status=TripParticipant.ATTENDANCE_PRESENT,
    ).count()


def calculate_current_streak(user):
    finished_trips = Trip.objects.filter(
        status=Trip.STATUS_FINISHED,
    ).order_by("-start_date", "-id")

    streak = 0

    for trip in finished_trips:
        was_present = TripParticipant.objects.filter(
            user=user,
            trip=trip,
            attendance_status=TripParticipant.ATTENDANCE_PRESENT,
        ).exists()

        if was_present:
            streak += 1
        else:
            break

    return streak


def calculate_longest_streak(user):
    finished_trips = Trip.objects.filter(
        status=Trip.STATUS_FINISHED,
    ).order_by("start_date", "id")

    longest_streak = 0
    current_streak = 0

    for trip in finished_trips:
        was_present = TripParticipant.objects.filter(
            user=user,
            trip=trip,
            attendance_status=TripParticipant.ATTENDANCE_PRESENT,
        ).exists()

        if was_present:
            current_streak += 1
            longest_streak = max(longest_streak, current_streak)
        else:
            current_streak = 0

    return longest_streak


def calculate_streak_score(current_streak):
    return min(current_streak * 2, 10)


def calculate_diversity_score(user):
    trip_types_count = (
        TripParticipant.objects.filter(
            user=user,
            trip__status=Trip.STATUS_FINISHED,
            attendance_status=TripParticipant.ATTENDANCE_PRESENT,
        )
        .values("trip__trip_type")
        .distinct()
        .count()
    )

    return min(trip_types_count * 2, 10)


def calculate_loyalty_score(user):
    total_trips = calculate_total_trips(user)
    return min(total_trips, 10)


def calculate_bonus_score(user):
    organized_trips_count = Trip.objects.filter(
        created_by=user,
        status=Trip.STATUS_FINISHED,
    ).count()

    return min(organized_trips_count, 5)


def calculate_total_score(
    attendance_percent,
    recent_trips,
    diversity_score,
    loyalty_score,
    streak_score,
    bonus_score,
):
    attendance_score = min(round(float(attendance_percent) * 0.50), 50)
    activity_score = min(recent_trips * 3, 15)

    total_score = (
        attendance_score
        + activity_score
        + diversity_score
        + loyalty_score
        + streak_score
        + bonus_score
    )

    return min(total_score, 100)


def find_rank_for_score(score):
    score = int(score)

    return (
        Rank.objects.filter(
            is_active=True,
            min_score__lte=score,
            max_score__gte=score,
        )
        .order_by("min_score")
        .first()
    )


def recalculate_user_stats(user):
    attendance_percent = calculate_attendance_percent(user)
    total_trips = calculate_total_trips(user)
    recent_trips = calculate_recent_trips(user)

    current_streak = calculate_current_streak(user)
    longest_streak = calculate_longest_streak(user)
    streak_score = calculate_streak_score(current_streak)

    diversity_score = calculate_diversity_score(user)
    loyalty_score = calculate_loyalty_score(user)
    bonus_score = calculate_bonus_score(user)

    total_score = calculate_total_score(
        attendance_percent=attendance_percent,
        recent_trips=recent_trips,
        diversity_score=diversity_score,
        loyalty_score=loyalty_score,
        streak_score=streak_score,
        bonus_score=bonus_score,
    )

    current_rank = find_rank_for_score(total_score)

    user_stat, _created = UserStat.objects.update_or_create(
        user=user,
        defaults={
            "attendance_percent": attendance_percent,
            "total_trips": total_trips,
            "recent_trips": recent_trips,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "streak_score": streak_score,
            "diversity_score": diversity_score,
            "loyalty_score": loyalty_score,
            "bonus_score": bonus_score,
            "total_score": total_score,
            "current_rank": current_rank,
        },
    )

    award_automatic_badges_for_user(user)

    return user_stat


def recalculate_all_user_stats():
    User = get_user_model()
    users = User.objects.filter(is_active=True)

    results = []

    for user in users:
        user_stat = recalculate_user_stats(user)
        results.append(user_stat)

    return results


def get_ranking_queryset():
    return (
        UserStat.objects.select_related("user", "current_rank")
        .all()
        .order_by(
            "-total_score",
            "-attendance_percent",
            "-total_trips",
            "-current_streak",
            "-longest_streak",
            "user__username",
        )
    )