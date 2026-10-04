from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import AllowAny, BasePermission, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Hall, Movie, Seat, Session
from .serializers import (
    HallSerializer,
    MovieSerializer,
    SeatSerializer,
    SessionSerializer,
)


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return request.user.is_authenticated and request.user.is_staff


class MovieListView(ListCreateAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [IsAdminOrReadOnly]


class MovieDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [IsAdminOrReadOnly]


class SessionListView(ListCreateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAdminOrReadOnly]


class SeatListView(ListAPIView):
    serializer_class = SeatSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        hall_id = self.request.query_params.get("hall")

        if hall_id:
            return Seat.objects.filter(hall_id=hall_id).order_by("row", "number")

        return Seat.objects.all().order_by("hall_id", "row", "number")


class SessionSeatListView(ListAPIView):
    serializer_class = SeatSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        session_id = self.kwargs["session_id"]

        session = get_object_or_404(
            Session,
            id=session_id,
        )

        return Seat.objects.filter(
            hall=session.hall,
        ).order_by(
            "row",
            "number",
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()

        session_id = self.kwargs["session_id"]

        context["session"] = get_object_or_404(
            Session,
            id=session_id,
        )

        return context


class HallListView(ListCreateAPIView):
    queryset = Hall.objects.all().order_by("name")
    serializer_class = HallSerializer
    permission_classes = [IsAdminOrReadOnly]


class HallDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    permission_classes = [IsAdminOrReadOnly]


class SeatDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    permission_classes = [IsAdminOrReadOnly]


class SessionDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAdminOrReadOnly]


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(
            username=username,
            password=password,
        )

        if user is None or not user.is_staff:
            return Response(
                {"detail": "Неверный логин или пароль."},
                status=401,
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "username": user.username,
            }
        )
