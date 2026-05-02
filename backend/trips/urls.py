from django.urls import path

from trips.views import (
    AddTripParticipantView,
    RemoveTripParticipantView,
    TripDetailView,
    TripListCreateView,
    TripParticipantListView,
    TripTypeListCreateView,
)


urlpatterns = [
    path("types/", TripTypeListCreateView.as_view(), name="trip-types"),
    path("", TripListCreateView.as_view(), name="trip-list-create"),
    path("<int:pk>/", TripDetailView.as_view(), name="trip-detail"),
    path("<int:trip_id>/participants/", TripParticipantListView.as_view(), name="trip-participants"),
    path("<int:trip_id>/participants/add/", AddTripParticipantView.as_view(), name="trip-participant-add"),
    path(
        "<int:trip_id>/participants/<int:participant_id>/remove/",
        RemoveTripParticipantView.as_view(),
        name="trip-participant-remove",
    ),
]