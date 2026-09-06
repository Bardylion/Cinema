from rest_framework import serializers
from .models import Movie, Session, Seat, Hall


class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "description",
            "duration",
            "age_rating",
        ]

class SessionSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(
        source="movie.title",
        read_only=True,
    )
    hall_name = serializers.CharField(
        source="hall.name",
        read_only=True,
    )

    class Meta:
        model = Session
        fields = [
            "id",
            "movie",
            "movie_title",
            "hall",
            "hall_name",
            "start_time",
            "base_price",
        ]

class SeatSerializer(serializers.ModelSerializer):
    booked = serializers.SerializerMethodField()

    def get_booked(self, obj):
        session = self.context.get("session")

        if not session:
            return False

        return obj.tickets.filter(
            session=session,
        ).exists()

    class Meta:
        model = Seat
        fields = [
            "id",
            "hall",
            "row",
            "number",
            "seat_type",
            "booked",
        ]
        
class HallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = [
            "id",
            "name",
            "rows",
            "seats_per_row",
        ]

    def create(self, validated_data):
        hall = Hall.objects.create(**validated_data)

        seats = []

        for row in range(1, hall.rows + 1):
            for number in range(1, hall.seats_per_row + 1):
                seats.append(
                    Seat(
                        hall=hall,
                        row=row,
                        number=number,
                        seat_type=Seat.NORMAL,
                    )
                )

        Seat.objects.bulk_create(seats)

        return hall