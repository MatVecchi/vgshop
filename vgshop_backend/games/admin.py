from django.contrib import admin
from .models import Tag, Game, GameImage

admin.site.register(Tag)
@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_date')
    readonly_fields = ('release_date',)
admin.site.register(GameImage)
