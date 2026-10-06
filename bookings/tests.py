from django.test import TestCase
from rest_framework.test import APIClient

from cinema.models import Hall, Movie, Seat, Session


class BookingAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.hall = Hall.objects.create(
            name="Тестовый зал",
            rows=2,
            seats_per_row=3,
            is_active=True,
        )

        self.seats = []

        for row in range(1, 3):
            for number in range(1, 4):
                self.seats.append(
                    Seat.objects.create(
                        hall=self.hall,
                        row=row,
                        number=number,
                        seat_type=Seat.NORMAL,
                    )
                )

        self.movie = Movie.objects.create(
            title="Тестовый фильм",
            description="Описание",
            duration=120,
            age_rating="12+",
        )

        self.session = Session.objects.create(
            movie=self.movie,
            hall=self.hall,
            start_time="2026-12-01T19:00:00Z",
            base_price=500,
        )

    def test_create_booking(self):
        response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "Test User",
                "customer_email": "test@example.com",
                "session": self.session.id,
                "seats": [self.seats[0].id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["customer_name"], "Test User")
        self.assertEqual(len(response.data["tickets"]), 1)
        self.assertEqual(response.data["tickets"][0]["price"], "500.00")

    def test_cannot_book_occupied_seat(self):
        # Сначала бронируем место
        first_response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "First User",
                "customer_email": "first@example.com",
                "session": self.session.id,
                "seats": [self.seats[0].id],
            },
            format="json",
        )

        self.assertEqual(first_response.status_code, 201)

        # Пытаемся забронировать то же место ещё раз
        second_response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "Second User",
                "customer_email": "second@example.com",
                "session": self.session.id,
                "seats": [self.seats[0].id],
            },
            format="json",
        )

        self.assertEqual(second_response.status_code, 400)

    def test_cannot_book_seat_from_another_hall(self):
        other_hall = Hall.objects.create(
            name="Другой зал",
            rows=1,
            seats_per_row=1,
        )

        other_seat = Seat.objects.create(
            hall=other_hall,
            row=1,
            number=1,
            seat_type=Seat.NORMAL,
        )

        response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "Test User",
                "customer_email": "test@example.com",
                "session": self.session.id,
                "seats": [other_seat.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_vip_seat_price(self):
        vip_seat = Seat.objects.create(
            hall=self.hall,
            row=2,
            number=4,
            seat_type=Seat.VIP,
        )

        response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "VIP User",
                "customer_email": "vip@example.com",
                "session": self.session.id,
                "seats": [vip_seat.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.data["tickets"][0]["price"],
            "700.00",
        )

    def test_create_booking_with_multiple_seats(self):
        response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "Multiple Seats User",
                "customer_email": "multiple@example.com",
                "session": self.session.id,
                "seats": [
                    self.seats[0].id,
                    self.seats[1].id,
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data["tickets"]), 2)

        self.assertEqual(
            response.data["tickets"][0]["price"],
            "500.00",
        )
        self.assertEqual(
            response.data["tickets"][1]["price"],
            "500.00",
        )

    def test_ticket_has_code_and_qr(self):
        response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "QR User",
                "customer_email": "qr@example.com",
                "session": self.session.id,
                "seats": [self.seats[0].id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        ticket = response.data["tickets"][0]

        self.assertTrue(ticket["ticket_code"])
        self.assertTrue(ticket["qr_code"])

    def test_booking_is_atomic(self):
        # Сначала занимаем первое место
        first_response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "First User",
                "customer_email": "first@example.com",
                "session": self.session.id,
                "seats": [self.seats[0].id],
            },
            format="json",
        )

        self.assertEqual(first_response.status_code, 201)

        # Пытаемся одним бронированием занять
        # уже занятое и свободное место
        second_response = self.client.post(
            "/api/bookings/",
            {
                "customer_name": "Second User",
                "customer_email": "second@example.com",
                "session": self.session.id,
                "seats": [
                    self.seats[0].id,
                    self.seats[1].id,
                ],
            },
            format="json",
        )

        self.assertEqual(second_response.status_code, 400)

        # Свободное место должно остаться свободным
        self.assertFalse(
            self.seats[1]
            .tickets.filter(
                session=self.session,
            )
            .exists()
        )

    def test_cannot_create_overlapping_session(self):
        from django.contrib.auth.models import User

        admin = User.objects.create_user(
            username="admin",
            password="admin123",
            is_staff=True,
        )

        self.client.force_authenticate(user=admin)

        response = self.client.post(
            "/api/sessions/",
            {
                "movie": self.movie.id,
                "hall": self.hall.id,
                "start_time": "2026-12-01T20:00:00Z",
                "base_price": 500,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
