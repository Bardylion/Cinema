from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Hall, Seat


class SeatAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="admin",
            password="admin123",
            is_staff=True,
        )

        self.client.force_authenticate(user=self.admin)

        self.hall = Hall.objects.create(
            name="Тестовый зал",
            rows=1,
            seats_per_row=1,
        )

        self.seat = Seat.objects.create(
            hall=self.hall,
            row=1,
            number=1,
            seat_type=Seat.NORMAL,
        )

    def test_admin_can_change_seat_type(self):
        response = self.client.patch(
            f"/api/seats/{self.seat.id}/",
            {
                "seat_type": Seat.VIP,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.seat.refresh_from_db()

        self.assertEqual(
            self.seat.seat_type,
            Seat.VIP,
        )

    def test_admin_can_disable_seat(self):
        response = self.client.patch(
            f"/api/seats/{self.seat.id}/",
            {
                "seat_type": Seat.DISABLED,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.seat.refresh_from_db()

        self.assertEqual(
            self.seat.seat_type,
            Seat.DISABLED,
        )


class HallAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username="admin",
            password="admin123",
            is_staff=True,
        )

        self.client.force_authenticate(user=self.admin)

        self.hall = Hall.objects.create(
            name="Тестовый зал",
            rows=2,
            seats_per_row=3,
            standard_price=500,
            vip_price=700,
        )

    def test_admin_can_change_hall_prices(self):
        response = self.client.patch(
            f"/api/halls/{self.hall.id}/",
            {
                "standard_price": "550.00",
                "vip_price": "800.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.hall.refresh_from_db()

        self.assertEqual(
            self.hall.standard_price,
            Decimal("550.00"),
        )
        self.assertEqual(
            self.hall.vip_price,
            Decimal("800.00"),
        )
