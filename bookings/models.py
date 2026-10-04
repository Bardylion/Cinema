from django.db import models


class Booking(models.Model):
    booking_code = models.CharField(
        max_length=20,
        unique=True,
    )
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.booking_code


class Ticket(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="tickets",
    )
    session = models.ForeignKey(
        "cinema.Session",
        on_delete=models.PROTECT,
        related_name="tickets",
    )
    seat = models.ForeignKey(
        "cinema.Seat",
        on_delete=models.PROTECT,
        related_name="tickets",
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    ticket_code = models.CharField(
        max_length=50,
        unique=True,
    )
    qr_code = models.ImageField(
        upload_to="tickets/qr/",
        blank=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["session", "seat"],
                name="unique_seat_per_session",
            ),
        ]

    def __str__(self):
        return self.ticket_code
