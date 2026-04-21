from rest_framework import serializers
from .models import User
from django.core import exceptions
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.contrib.auth.models import Group
from django.db import transaction

# Cero un serializer per la classe user
# Preso un oggetto Model: User lo trasforma in un JSON leggibile da react


# Serializer --> crea il dizionario validated data che contiene l'attributo di classe (se esiste) 
# in alternativa il relativo ed omonimo attributo del modello, se nessuno dei due esiste --> ignora

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'piva', 'website', 'profile_image']
        
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    isPublisher = serializers.BooleanField(write_only= True)
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'piva', 'website', 'isPublisher']

    @transaction.atomic
    def create(self, validated_data):
        is_publisher_value = validated_data.pop('isPublisher')
        password_value = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data, password= password_value)

        group, _ = Group.objects.get_or_create( name = "Publisher" if is_publisher_value else "Customer")
        user.groups.add(group)

        return user


    def validate_password(self, password):
        try:
            django_validate_password(password=password, user=User(self.initial_data.get("username")))
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return password
    
    def validate_piva(self, piva):
        if piva == "" or piva is None:
            return None
        return piva