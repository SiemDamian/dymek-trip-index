from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from rankings.models import Rank
from rankings.services import recalculate_all_user_stats
from badges.models import Badge
from trips.models import TripType, Trip, TripParticipant


class Command(BaseCommand):
    help = "Dodaje testowe typy wyjazdów, wyjazdy, uczestników, rangi i odznaki."

    def handle(self, *args, **options):
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

        ranks_data = [
            ("Nowy Towarzysz", 0, 15),
            ("Weekendowiec", 16, 30),
            ("Stały Bywalec", 31, 45),
            ("Weteran Wyjazdów", 46, 60),
            ("Filar Ekipy", 61, 75),
            ("Legenda Trasy", 76, 90),
            ("Ikona Wyjazdowa", 91, 100),
        ]

        for name, min_score, max_score in ranks_data:
            Rank.objects.update_or_create(
                name=name,
                defaults={
                    "min_score": min_score,
                    "max_score": max_score,
                    "description": f"Ranga dla wyniku {min_score}-{max_score}.",
                    "is_active": True,
                },
            )

        badges_data = [
            ("Pierwszy wyjazd", "Pierwszy wspólny wyjazd.", Badge.TRIGGER_TYPE_TRIPS_COUNT, 1),
            ("5 wyjazdów", "Udział w co najmniej 5 wyjazdach.", Badge.TRIGGER_TYPE_TRIPS_COUNT, 5),
            ("Wysoka frekwencja", "Frekwencja minimum 80%.", Badge.TRIGGER_TYPE_ATTENDANCE_PERCENT, 80),
            ("Dobry wynik", "Trip Index minimum 50 punktów.", Badge.TRIGGER_TYPE_SCORE, 50),
            ("Legenda punktów", "Trip Index minimum 80 punktów.", Badge.TRIGGER_TYPE_SCORE, 80),
        ]

        for name, description, trigger_type, trigger_value in badges_data:
            Badge.objects.update_or_create(
                name=name,
                defaults={
                    "description": description,
                    "badge_type": Badge.BADGE_TYPE_AUTOMATIC,
                    "trigger_type": trigger_type,
                    "trigger_value": trigger_value,
                    "is_active": True,
                },
            )

        Badge.objects.update_or_create(
            name="Organizator sezonu",
            defaults={
                "description": "Specjalna odznaka za organizację wyjazdów.",
                "badge_type": Badge.BADGE_TYPE_SPECIAL,
                "trigger_type": Badge.TRIGGER_TYPE_MANUAL,
                "trigger_value": None,
                "is_active": True,
            },
        )

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
            trip, _ = Trip.objects.update_or_create(
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

        results = recalculate_all_user_stats()

        self.stdout.write(
            self.style.SUCCESS(
                f"Gotowe. Dodano dane testowe i przeliczono statystyki dla {len(results)} użytkowników. "
                "Hasło testowych użytkowników: test12345"
            )
        )
