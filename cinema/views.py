from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from django.shortcuts import get_object_or_404
from .models import Movie, Session, Seat, Hall
from .serializers import (
    MovieSerializer,
    SessionSerializer,
    SeatSerializer,
    HallSerializer,
)
from rest_framework.permissions import BasePermission, IsAdminUser

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
    queryset = Seat.objects.all()
    serializer_class = SeatSerializer
    permission_classes = [IsAdminUser]

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
    queryset = Hall.objects.all()
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