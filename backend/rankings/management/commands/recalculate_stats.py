from django.core.management.base import BaseCommand

from rankings.services import recalculate_all_user_stats


class Command(BaseCommand):
    help = "Przelicza statystyki, ranking, streaki, rangi i automatyczne odznaki dla wszystkich użytkowników."

    def handle(self, *args, **options):
        self.stdout.write("Start przeliczania statystyk...")

        results = recalculate_all_user_stats()

        self.stdout.write(
            self.style.SUCCESS(
                f"Gotowe. Przeliczono statystyki dla {len(results)} użytkowników."
            )
        )
