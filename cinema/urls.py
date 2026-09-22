from django.urls import path

from .views import (
    MovieListView,
    MovieDetailView,
    SessionListView,
    SeatListView,
    SessionSeatListView,
    HallListView,
    HallDetailView,
    SeatDetailView,
    SessionDetailView,
    AdminLoginView
)
urlpatterns = [
    path("movies/", MovieListView.as_view(), name="movie-list"),
    path("sessions/", SessionListView.as_view(), name="session-list"),
    path(
    "sessions/<int:pk>/",
    SessionDetailView.as_view(),
    name="session-detail",
    ),
    path("seats/", SeatListView.as_view(), name="seat-list"),
    path(
        "seats/<int:pk>/",
        SeatDetailView.as_view(),
        name="seat-detail",
    ),
    path(
        "sessions/<int:session_id>/seats/",
        SessionSeatListView.as_view(),
        name="session-seat-list",
    ),
    path(
        "movies/<int:pk>/",
        MovieDetailView.as_view(),
        name="movie-detail",
    ),
    path("halls/", HallListView.as_view(), name="hall-list"),
    path(
        "halls/<int:pk>/",
        HallDetailView.as_view(),
        name="hall-detail",
    ),
    path("admin/login/", AdminLoginView.as_view()),
]