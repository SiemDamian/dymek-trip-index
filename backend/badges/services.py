from badges.models import Badge, UserBadge
from trips.models import TripParticipant


def award_badge_to_user(user, badge, awarded_by=None, reason=""):
    user_badge, created = UserBadge.objects.get_or_create(
        user=user,
        badge=badge,
        defaults={
            "awarded_by": awarded_by,
            "reason": reason,
        },
    )

    return user_badge, created


def get_user_finished_trips_count(user):
    return TripParticipant.objects.filter(
        user=user,
        trip__status="finished",
        attendance_status="present",
    ).count()


def award_trips_count_badges(user):
    trips_count = get_user_finished_trips_count(user)

    badges = Badge.objects.filter(
        is_active=True,
        badge_type=Badge.BADGE_TYPE_AUTOMATIC,
        trigger_type=Badge.TRIGGER_TYPE_TRIPS_COUNT,
        trigger_value__isnull=False,
        trigger_value__lte=trips_count,
    )

    awarded = []

    for badge in badges:
        user_badge, created = award_badge_to_user(
            user=user,
            badge=badge,
            reason=f"Automatycznie przyznano za udział w {trips_count} wyjazdach.",
        )

        if created:
            awarded.append(user_badge)

    return awarded


def award_attendance_percent_badges(user):
    if not hasattr(user, "stats"):
        return []

    attendance_percent = user.stats.attendance_percent

    badges = Badge.objects.filter(
        is_active=True,
        badge_type=Badge.BADGE_TYPE_AUTOMATIC,
        trigger_type=Badge.TRIGGER_TYPE_ATTENDANCE_PERCENT,
        trigger_value__isnull=False,
        trigger_value__lte=attendance_percent,
    )

    awarded = []

    for badge in badges:
        user_badge, created = award_badge_to_user(
            user=user,
            badge=badge,
            reason=f"Automatycznie przyznano za frekwencję {attendance_percent}%.",
        )

        if created:
            awarded.append(user_badge)

    return awarded


def award_score_badges(user):
    if not hasattr(user, "stats"):
        return []

    total_score = user.stats.total_score

    badges = Badge.objects.filter(
        is_active=True,
        badge_type=Badge.BADGE_TYPE_AUTOMATIC,
        trigger_type=Badge.TRIGGER_TYPE_SCORE,
        trigger_value__isnull=False,
        trigger_value__lte=total_score,
    )

    awarded = []

    for badge in badges:
        user_badge, created = award_badge_to_user(
            user=user,
            badge=badge,
            reason=f"Automatycznie przyznano za wynik {total_score} pkt.",
        )

        if created:
            awarded.append(user_badge)

    return awarded


def award_automatic_badges_for_user(user):
    awarded = []

    awarded.extend(award_trips_count_badges(user))
    awarded.extend(award_attendance_percent_badges(user))
    awarded.extend(award_score_badges(user))

    return awarded