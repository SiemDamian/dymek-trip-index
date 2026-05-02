from pathlib import Path
import subprocess
import sys
import re


APPS = ["accounts", "trips", "rankings", "badges", "audit", "core"]


def run_command(command: list[str]) -> None:
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Błąd przy komendzie: {' '.join(command)}")
        print(result.stdout)
        print(result.stderr)
        sys.exit(1)


def ensure_backend_root() -> Path:
    current = Path.cwd()
    manage_py = current / "manage.py"
    config_dir = current / "config"

    if not manage_py.exists() or not config_dir.exists():
        print("Uruchom ten skrypt z folderu backend/, gdzie są manage.py i config/.")
        sys.exit(1)

    return current


def create_app_if_missing(app_name: str) -> None:
    app_dir = Path(app_name)
    if app_dir.exists():
        print(f"[OK] Appka '{app_name}' już istnieje.")
        return

    print(f"[TWORZENIE] Appka '{app_name}'...")
    run_command([sys.executable, "manage.py", "startapp", app_name])


def ensure_file(path: Path, content: str) -> None:
    if not path.exists():
        path.write_text(content, encoding="utf-8")
        print(f"[UTWORZONO] {path}")
    else:
        print(f"[OK] {path} już istnieje.")


def ensure_app_support_files(app_name: str) -> None:
    app_path = Path(app_name)

    serializers_content = """from rest_framework import serializers
"""

    urls_content = f"""from django.urls import path

urlpatterns = [
]
"""

    services_content = '''"""
Miejsce na logikę biznesową dla appki.
"""
'''

    permissions_content = """from rest_framework.permissions import BasePermission


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in ("GET", "HEAD", "OPTIONS") or (
            request.user and request.user.is_staff
        )
"""

    ensure_file(app_path / "serializers.py", serializers_content)
    ensure_file(app_path / "urls.py", urls_content)
    ensure_file(app_path / "services.py", services_content)

    # permissions.py tylko tam, gdzie faktycznie może się przydać
    if app_name in {"accounts", "trips", "rankings", "badges"}:
        ensure_file(app_path / "permissions.py", permissions_content)


def add_apps_to_installed_apps(settings_path: Path) -> None:
    content = settings_path.read_text(encoding="utf-8")

    if "rest_framework" not in content:
        content = re.sub(
            r"INSTALLED_APPS\s*=\s*\[(.*?)\]",
            lambda m: _insert_apps_into_installed_apps(
                m.group(0),
                ['    "rest_framework",', '    "corsheaders",']
                + [f'    "{app}",' for app in APPS],
            ),
            content,
            flags=re.DOTALL,
        )
    else:
        content = re.sub(
            r"INSTALLED_APPS\s*=\s*\[(.*?)\]",
            lambda m: _insert_apps_into_installed_apps(
                m.group(0),
                [f'    "{app}",' for app in APPS],
            ),
            content,
            flags=re.DOTALL,
        )

    # Middleware: corsheaders na początek
    if '"corsheaders.middleware.CorsMiddleware"' not in content:
        content = re.sub(
            r"MIDDLEWARE\s*=\s*\[(.*?)\]",
            lambda m: _insert_middleware(m.group(0), '    "corsheaders.middleware.CorsMiddleware",'),
            content,
            flags=re.DOTALL,
        )

    # REST_FRAMEWORK
    if "REST_FRAMEWORK =" not in content:
        content += """

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
"""

    settings_path.write_text(content, encoding="utf-8")
    print(f"[ZAKTUALIZOWANO] {settings_path}")


def _insert_apps_into_installed_apps(installed_apps_block: str, new_lines: list[str]) -> str:
    lines = installed_apps_block.splitlines()

    existing = set()
    for line in lines:
        stripped = line.strip().strip(",").strip('"').strip("'")
        if stripped:
            existing.add(stripped)

    insert_index = len(lines) - 1  # przed ]
    additions = []

    for new_line in new_lines:
        value = new_line.strip().strip(",").strip('"').strip("'")
        if value not in existing:
            additions.append(new_line)

    if additions:
        lines[insert_index:insert_index] = additions

    return "\n".join(lines)


def _insert_middleware(middleware_block: str, middleware_line: str) -> str:
    lines = middleware_block.splitlines()
    existing = set()

    for line in lines:
        stripped = line.strip().strip(",").strip('"').strip("'")
        if stripped:
            existing.add(stripped)

    value = middleware_line.strip().strip(",").strip('"').strip("'")
    if value not in existing:
        lines.insert(1, middleware_line)

    return "\n".join(lines)


def update_project_urls(urls_path: Path) -> None:
    content = urls_path.read_text(encoding="utf-8")

    if "include" not in content:
        content = content.replace(
            "from django.urls import path",
            "from django.urls import path, include",
        )

    required_paths = [
        '    path("api/accounts/", include("accounts.urls")),',
        '    path("api/trips/", include("trips.urls")),',
        '    path("api/rankings/", include("rankings.urls")),',
        '    path("api/badges/", include("badges.urls")),',
    ]

    match = re.search(r"urlpatterns\s*=\s*\[(.*?)\]", content, flags=re.DOTALL)
    if not match:
        print("Nie udało się znaleźć urlpatterns w config/urls.py")
        sys.exit(1)

    block = match.group(0)
    lines = block.splitlines()

    existing = set()
    for line in lines:
        stripped = line.strip()
        existing.add(stripped)

    insert_index = len(lines) - 1
    to_add = [line for line in required_paths if line.strip() not in existing]

    if to_add:
        lines[insert_index:insert_index] = to_add

    new_block = "\n".join(lines)
    content = content.replace(block, new_block)

    urls_path.write_text(content, encoding="utf-8")
    print(f"[ZAKTUALIZOWANO] {urls_path}")


def main() -> None:
    backend_root = ensure_backend_root()

    settings_path = backend_root / "config" / "settings.py"
    urls_path = backend_root / "config" / "urls.py"

    for app in APPS:
        create_app_if_missing(app)
        ensure_app_support_files(app)

    add_apps_to_installed_apps(settings_path)
    update_project_urls(urls_path)

    print("\nGotowe.")
    print("Teraz uruchom:")
    print("python manage.py makemigrations")
    print("python manage.py migrate")


if __name__ == "__main__":
    main()