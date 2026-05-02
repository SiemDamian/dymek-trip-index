from rest_framework import serializers

from trips.models import Trip, TripType, TripParticipant


class TripTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripType
        fields = [
            "id",
            "name",
            "description",
            "is_active",
        ]


class TripParticipantSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    display_name = serializers.CharField(source="user.display_name", read_only=True)
    added_by_username = serializers.CharField(source="added_by.username", read_only=True)

    class Meta:
        model = TripParticipant
        fields = [
            "id",
            "trip",
            "user",
            "user_id",
            "username",
            "display_name",
            "attendance_status",
            "notes",
            "added_by",
            "added_by_username",
            "joined_at",
        ]
        read_only_fields = [
            "id",
            "user_id",
            "username",
            "display_name",
            "added_by_username",
            "joined_at",
        ]


class TripListSerializer(serializers.ModelSerializer):
    trip_type_name = serializers.CharField(source="trip_type.name", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    participants_count = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            "id",
            "title",
            "description",
            "location",
            "start_date",
            "end_date",
            "status",
            "trip_type",
            "trip_type_name",
            "created_by",
            "created_by_username",
            "participants_count",
            "participants",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_by_username",
            "participants_count",
            "participants",
            "created_at",
            "updated_at",
        ]

    def get_participants_count(self, obj):
        return obj.participants.filter(
            attendance_status=TripParticipant.ATTENDANCE_PRESENT
        ).count()

    def get_participants(self, obj):
        return [
            {
                "id": participant.id,
                "user_id": participant.user.id,
                "username": participant.user.username,
                "display_name": participant.user.display_name,
                "attendance_status": participant.attendance_status,
            }
            for participant in obj.participants.all()
        ]


class TripDetailSerializer(serializers.ModelSerializer):
    trip_type_name = serializers.CharField(source="trip_type.name", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    participants = TripParticipantSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = [
            "id",
            "title",
            "description",
            "location",
            "start_date",
            "end_date",
            "status",
            "trip_type",
            "trip_type_name",
            "created_by",
            "created_by_username",
            "participants",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_by_username",
            "participants",
            "created_at",
            "updated_at",
        ]


class AddTripParticipantSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    attendance_status = serializers.ChoiceField(
        choices=TripParticipant.ATTENDANCE_CHOICES,
        default=TripParticipant.ATTENDANCE_PRESENT,
    )
    notes = serializers.CharField(required=False, allow_blank=True)