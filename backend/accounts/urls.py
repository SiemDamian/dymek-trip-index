from django.urls import path

from accounts.views import (
    CurrentUserView,
    LoginView,
    LogoutView,
    UserListView,
)


urlpatterns = [
    path("login/", LoginView.as_view(), name="accounts-login"),
    path("logout/", LogoutView.as_view(), name="accounts-logout"),
    path("me/", CurrentUserView.as_view(), name="accounts-me"),
    path("users/", UserListView.as_view(), name="accounts-users"),
]