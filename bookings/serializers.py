import io
import secrets
from decimal import Decimal

import qrcode
from django.core.files.base import ContentFile
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers

from cinema.models import Seat, Session

from .models import Booking, Ticket


def generate_ticket_qr(ticket):
    qr = qrcode.make(f"Ticket: {ticket.ticket_code}")

    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")

    ticket.qr_code.save(
        f"{ticket.ticket_code}.png",
        ContentFile(buffer.getvalue()),
        save=True,
    )


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "id",
            "booking",
            "session",
            "seat",
            "price",
            "ticket_code",
            "qr_code",
        ]
        read_only_fields = [
            "id",
            "price",
            "ticket_code",
            "qr_code",
        ]

    def validate(self, attrs):
        session = attrs["session"]
        seat = attrs["seat"]

        if session.hall_id != seat.hall_id:
            raise serializers.ValidationError(
                "Выбранное место не принадлежит залу этого сеанса."
            )

        if Ticket.objects.filter(session=session, seat=seat).exists():
            raise serializers.ValidationError(
                "Это место уже забронировано на выбранный сеанс."
            )

        return attrs


class TicketDetailSerializer(serializers.ModelSerializer):
    movie = serializers.CharField(source="session.movie.title")
    hall = serializers.CharField(source="session.hall.name")
    row = serializers.IntegerField(source="seat.row")
    seat_number = serializers.IntegerField(source="seat.number")
    seat_type = serializers.CharField(source="seat.get_seat_type_display")
    start_time = serializers.DateTimeField(
        source="session.start_time",
        format="%d.%m.%Y %H:%M",
    )

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_code",
            "session_id",
            "movie",
            "hall",
            "start_time",
            "row",
            "seat_number",
            "seat_type",
            "price",
            "qr_code",
        ]


class BookingCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=100)
    customer_email = serializers.EmailField()
    session = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(),
    )
    seats = serializers.PrimaryKeyRelatedField(
        queryset=Seat.objects.all(),
        many=True,
    )

    def validate(self, attrs):
        session = attrs["session"]
        seats = attrs["seats"]

        if not session.hall.is_active:
            raise serializers.ValidationError(
                "Продажи билетов для этого зала ещё не открыты."
            )

        if session.start_time <= timezone.now():
            raise serializers.ValidationError("Нельзя забронировать прошедший сеанс.")

        for seat in seats:
            if seat.hall_id != session.hall_id:
                raise serializers.ValidationError(
                    f"Место {seat.id} не принадлежит залу выбранного сеанса."
                )

            if seat.seat_type == Seat.DISABLED:
                raise serializers.ValidationError(
                    f"Место {seat.id} недоступно для бронирования."
                )

            if Ticket.objects.filter(
                session=session,
                seat=seat,
            ).exists():
                raise serializers.ValidationError(
                    f"Место {seat.id} уже забронировано на этот сеанс."
                )

        return attrs

    def create(self, validated_data):
        session = validated_data["session"]
        seats = validated_data["seats"]

        try:
            with transaction.atomic():
                booking = Booking.objects.create(
                    booking_code=f"BK{secrets.token_hex(6).upper()}",
                    customer_name=validated_data["customer_name"],
                    customer_email=validated_data["customer_email"],
                )

                for seat in seats:
                    price = session.base_price

                    if seat.seat_type == Seat.VIP:
                        price += Decimal("200.00")

                    ticket = Ticket.objects.create(
                        booking=booking,
                        session=session,
                        seat=seat,
                        price=price,
                        ticket_code=f"TKT{secrets.token_hex(8).upper()}",
                    )

                    generate_ticket_qr(ticket)

        except IntegrityError:
            raise serializers.ValidationError(
                "Одно из выбранных мест уже забронировано на этот сеанс."
            )

        return booking


class BookingDetailSerializer(serializers.ModelSerializer):
    tickets = TicketDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "booking_code",
            "customer_name",
            "customer_email",
            "created_at",
            "tickets",
        ]
