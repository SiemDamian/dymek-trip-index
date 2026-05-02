from rest_framework import serializers

from badges.models import Badge, UserBadge


class BadgeSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Badge
        fields = [
            "id",
            "name",
            "description",
            "image",
            "image_url",
            "badge_type",
            "trigger_type",
            "trigger_value",
            "is_active",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")

        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)

        if obj.image:
            return obj.image.url

        return None


class UserBadgeSerializer(serializers.ModelSerializer):
    badge_id = serializers.IntegerField(source="badge.id", read_only=True)
    badge_name = serializers.CharField(source="badge.name", read_only=True)
    badge_description = serializers.CharField(source="badge.description", read_only=True)
    badge_type = serializers.CharField(source="badge.badge_type", read_only=True)
    badge_image_url = serializers.SerializerMethodField()

    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    display_name = serializers.CharField(source="user.display_name", read_only=True)

    awarded_by_username = serializers.CharField(source="awarded_by.username", read_only=True)

    class Meta:
        model = UserBadge
        fields = [
            "id",
            "user_id",
            "username",
            "display_name",
            "badge_id",
            "badge_name",
            "badge_description",
            "badge_type",
            "badge_image_url",
            "awarded_at",
            "awarded_by",
            "awarded_by_username",
            "reason",
        ]

    def get_badge_image_url(self, obj):
        request = self.context.get("request")

        if obj.badge.image and request:
            return request.build_absolute_uri(obj.badge.image.url)

        if obj.badge.image:
            return obj.badge.image.url

        return None


class AwardBadgeSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    badge_id = serializers.IntegerField()
    reason = serializers.CharField(required=False, allow_blank=True)