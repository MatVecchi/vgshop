from django.db import migrations

def create_default_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')

    # Creazione Gruppi
    publisher_group, p_created = Group.objects.get_or_create(name='Publisher')
    customer_group, c_created = Group.objects.get_or_create(name='Customer')

    if p_created:
        print("\nGruppo Publisher creato con successo\n")
    if c_created:
        print("\nGruppo Customer creato con successo\n")

class Migration(migrations.Migration):
    dependencies = [
        ('account', '0001_initial'), # 1^ migrazione per la creazione dello user
        ('auth', '0012_alter_user_first_name_max_length'), # sicurezza
    ]

    operations = [
        migrations.RunPython(create_default_groups),
    ]