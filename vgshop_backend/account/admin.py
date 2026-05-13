from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from account.models import User

class CustomAdminUser(UserAdmin):

    additional_info = (
        ("Immagine profilo", {"fields": ["profile_image"]}),
        ("Informazioni Publisher", {"fields": ["piva", "website"]}),
        ("Informazioni Famiglia", {"fields": ["family"]}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + additional_info
    fieldsets = UserAdmin.fieldsets + additional_info

    list_display = ["username", "email", "family", "piva", "website"]

admin.site.register(User, CustomAdminUser)
