from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cart', '0003_collection_remove_library_unique_in_library_game_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='collection',
            old_name='nome',
            new_name='name',
        ),
    ]
