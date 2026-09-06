from django.urls import path

from .views import (
    BookingListCreateView,
    BookingDetailView,
    TicketCreateView,
    TicketDetailView,
)


urlpatterns = [
    path(
        "bookings/",
        BookingListCreateView.as_view(),
        name="booking-list",
    ),
    path(
        "bookings/<int:pk>/",
        BookingDetailView.as_view(),
        name="booking-detail",
    ),
    path(
        "tickets/",
        TicketCreateView.as_view(),
        name="ticket-create",
    ),
    path(
        "tickets/<int:pk>/",
        TicketDetailView.as_view(),
        name="ticket-detail",
    ),
]