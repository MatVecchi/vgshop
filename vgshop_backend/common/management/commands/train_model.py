from django.core.management import call_command
from django.core.management.base import BaseCommand
from recomendation_system.training import RecomendationSystemTraining


class Command(BaseCommand):
    help = "Train the AI model and save the neural network"

    def handle(self, *args, **options):
        recomendation_system = RecomendationSystemTraining()
        recomendation_system.start_training_session()
        recomendation_system.save_model()
