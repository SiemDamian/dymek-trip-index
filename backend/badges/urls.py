from django.urls import path

from badges.views import (
    AwardBadgeView,
    BadgeListView,
    MyBadgesView,
    UserBadgesView,
)


urlpatterns = [
    path("", BadgeListView.as_view(), name="badge-list"),
    path("me/", MyBadgesView.as_view(), name="my-badges"),
    path("users/<int:user_id>/", UserBadgesView.as_view(), name="user-badges"),
    path("award/", AwardBadgeView.as_view(), name="award-badge"),
]