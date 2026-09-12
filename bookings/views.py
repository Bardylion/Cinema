import secrets
from rest_framework.permissions import BasePermission, IsAdminUser
from rest_framework.generics import (
    CreateAPIView,
    ListCreateAPIView,
    RetrieveAPIView,
)
from rest_framework.response import Response
from .models import Booking, Ticket
from .serializers import (
    BookingCreateSerializer,
    BookingDetailSerializer,
    TicketSerializer,
    TicketDetailSerializer,
)
from django.shortcuts import get_object_or_404

class IsAdminOrCreateOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method == "POST":
            return True

        return request.user.is_authenticated and request.user.is_staff
    
class BookingListCreateView(ListCreateAPIView):
    queryset = Booking.objects.all().order_by("-created_at")
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAdminOrCreateOnly]
    def get_serializer_class(self):
        if self.request.method == "GET":
            return BookingDetailSerializer

        return BookingCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = serializer.save()

        return Response(
            BookingDetailSerializer(booking).data,
            status=201,
        )

class BookingDetailView(RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAdminUser]

class TicketCreateView(CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        ticket_code = secrets.token_hex(8).upper()

        session = serializer.validated_data["session"]
        seat = serializer.validated_data["seat"]

        price = session.base_price

        if seat.seat_type == "VIP":
            price += 200

        ticket = serializer.save(
            ticket_code=f"TKT{ticket_code}",
            price=price,
        )

        qr = qrcode.make(
            f"Ticket: {ticket.ticket_code}"
        )

        buffer = io.BytesIO()
        qr.save(buffer, format="PNG")

        ticket.qr_code.save(
            f"{ticket.ticket_code}.png",
            ContentFile(buffer.getvalue()),
            save=True,
        )

class TicketDetailView(RetrieveAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketDetailSerializer
    permission_classes = [IsAdminUser]

class BookingByCodeView(RetrieveAPIView):
    serializer_class = BookingDetailSerializer
    permission_classes = []
    lookup_field = "booking_code"

    def get_object(self):
        return get_object_or_404(
            Booking,
            booking_code=self.kwargs["booking_code"],
        )