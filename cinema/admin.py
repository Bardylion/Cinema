from django.contrib import admin

from .models import Hall, Movie, Seat, Session


@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ("name", "rows", "seats_per_row")

    def save_model(self, request, obj, form, change):
        is_new = not change

        super().save_model(request, obj, form, change)

        if is_new:
            seats = []

            for row in range(1, obj.rows + 1):
                for number in range(1, obj.seats_per_row + 1):
                    seats.append(
                        Seat(
                            hall=obj,
                            row=row,
                            number=number,
                            seat_type=Seat.NORMAL,
                        )
                    )

            Seat.objects.bulk_create(seats)


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ("hall", "row", "number", "seat_type")
    list_filter = ("hall", "seat_type")


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ("title", "duration", "age_rating", "created_at")
    list_filter = ("age_rating",)
    search_fields = ("title",)


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("movie", "hall", "start_time", "base_price")
    list_filter = ("hall", "movie")
    search_fields = ("movie__title",)
    ordering = ("start_time",)
