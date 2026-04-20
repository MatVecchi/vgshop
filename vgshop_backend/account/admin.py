from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomAdminUser(UserAdmin):

    additional_info = (
        ("Immagine profilo", {"fields": ["profile_image"]}),
        ("Informazioni Publisher", {"fields": ["piva", "website"]}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + additional_info
    fieldsets = UserAdmin.fieldsets + additional_info

    list_display = ["username", "email", "piva", "website"]

admin.site.register(User, CustomAdminUser)
