from django.contrib.auth import get_user_model

from trips.models import TripType, Trip, TripParticipant
from rankings.services import recalculate_all_user_stats


User = get_user_model()


users_data = [
    ("janek", "Janek"),
    ("kuba", "Kuba"),
    ("ania", "Ania"),
    ("ola", "Ola"),
    ("mateusz", "Mateusz"),
]

users = {}

for username, display_name in users_data:
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            "display_name": display_name,
            "is_active": True,
        },
    )

    if created:
        user.set_password("test12345")
        user.save()

    users[username] = user


trip_types_data = [
    ("Imprezowy", "Wyjazd nastawiony głównie na integrację i imprezy."),
    ("Zwiedzanie", "Wyjazd nastawiony na atrakcje, miasta i zwiedzanie."),
    ("Góry", "Wyjazd trekkingowy lub górski."),
    ("Chill", "Luźny odpoczynek bez większego planu."),
    ("City break", "Krótki wyjazd miejski."),
]

trip_types = {}

for name, description in trip_types_data:
    trip_type, _ = TripType.objects.get_or_create(
        name=name,
        defaults={
            "description": description,
            "is_active": True,
        },
    )
    trip_types[name] = trip_type


trips_data = [
    ("Zakopane 2024", "Zakopane", "Góry", "2024-02-10", "2024-02-12", ["janek", "kuba", "ania"]),
    ("Kraków party weekend", "Kraków", "Imprezowy", "2024-04-05", "2024-04-07", ["janek", "kuba", "ola", "mateusz"]),
    ("Wrocław city break", "Wrocław", "City break", "2024-06-14", "2024-06-16", ["janek", "ania", "ola"]),
    ("Mazury chill", "Mazury", "Chill", "2024-08-01", "2024-08-05", ["kuba", "ania", "ola", "mateusz"]),
    ("Praga zwiedzanie", "Praga", "Zwiedzanie", "2024-10-11", "2024-10-14", ["janek", "kuba", "mateusz"]),
    ("Tatry 2025", "Tatry", "Góry", "2025-01-18", "2025-01-20", ["janek", "kuba", "ania", "ola"]),
    ("Budapeszt 2025", "Budapeszt", "City break", "2025-05-02", "2025-05-05", ["janek", "mateusz", "ola"]),
]

for title, location, trip_type_name, start_date, end_date, participant_usernames in trips_data:
    trip, created = Trip.objects.update_or_create(
        title=title,
        defaults={
            "description": f"Testowy wyjazd: {title}",
            "location": location,
            "start_date": start_date,
            "end_date": end_date,
            "status": Trip.STATUS_FINISHED,
            "trip_type": trip_types[trip_type_name],
            "created_by": users["janek"],
        },
    )

    for username in participant_usernames:
        TripParticipant.objects.update_or_create(
            trip=trip,
            user=users[username],
            defaults={
                "attendance_status": TripParticipant.ATTENDANCE_PRESENT,
                "added_by": users["janek"],
            },
        )


recalculate_all_user_stats()

print("Gotowe. Dodano wyjazdy, uczestników i przeliczono statystyki.")