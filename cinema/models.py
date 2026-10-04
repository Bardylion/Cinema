from django.db import models


class Hall(models.Model):
    name = models.CharField(max_length=100)  # название зала
    rows = models.PositiveIntegerField()  # количество рядов
    seats_per_row = models.PositiveIntegerField()  # мест в каждом ряду
    standard_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    vip_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    def __str__(self):
        return self.name


class Seat(models.Model):
    NORMAL = "NORMAL"
    VIP = "VIP"
    DISABLED = "DISABLED"

    SEAT_TYPES = [
        (NORMAL, "Обычное"),
        (VIP, "VIP"),
        (DISABLED, "Недоступное"),
    ]

    hall = models.ForeignKey(
        Hall,
        on_delete=models.CASCADE,
        related_name="seats",
    )
    row = models.PositiveIntegerField()
    number = models.PositiveIntegerField()
    seat_type = models.CharField(
        max_length=10,
        choices=SEAT_TYPES,
        default=NORMAL,
    )

    def __str__(self):
        return f"{self.hall.name} — ряд {self.row}, место {self.number}"

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["hall", "row", "number"],
                name="unique_seat_in_hall",
            ),
        ]


class Movie(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration = models.PositiveIntegerField()
    age_rating = models.CharField(max_length=10)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Session(models.Model):
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    hall = models.ForeignKey(
        Hall,
        on_delete=models.CASCADE,
        related_name="sessions",
    )
    start_time = models.DateTimeField()
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    def __str__(self):
        return f"{self.movie.title} — {self.start_time:%d.%m.%Y %H:%M}"
