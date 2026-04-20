from rest_framework import serializers
from .models import User

# Cero un serializer per la classe user
# Preso un oggetto Model: User lo trasforma in un JSON leggibile da react
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'piva', 'website', 'profile_image']
        