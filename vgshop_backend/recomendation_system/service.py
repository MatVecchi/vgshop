import os
import torch
from django.conf import settings
from recomendation_system.vgshop_model import VgshopRCNeuralModel
from games.models import Tag


class RecomendationSystemService:
    MODEL_DIR = settings.BASE_DIR / "recomendation_system/saved_models"
    MODEL_FILE = MODEL_DIR / "vgshop_model_trained.pt"

    def __init__(self):
        if not os.path.exists(self.MODEL_DIR):
            raise FileNotFoundError("Modello non trovato, esegui il comando train !")

        complete_model = torch.load(self.MODEL_FILE)
        self.map_user_code = complete_model["user_to_code"]
        self.map_game_code = complete_model["game_to_code"]
        self.total_tags = complete_model["total_tags"]
        self.all_tags = complete_model["all_tags"]

        self.model = VgshopRCNeuralModel(
            len(self.map_user_code), len(self.map_game_code), self.total_tags
        )
        self.model.load_state_dict(complete_model["model"])
        self.model.eval()

        print("Modello pronto !")

    def predict_score(self, user, game, game_tags):
        user_id = self.map_user_code.get(user, None)
        game_id = self.map_game_code.get(game, None)
        if user_id is None or game_id is None:
            if user_id is None:
                sample_key = next(iter(self.map_user_code), None)
                print(
                    f"[RecomendationService] user non trovato: "
                    f"ricevuto {user_id} (tipo {type(user).__name__}), "
                    f"chiavi del dict di tipo {type(sample_key).__name__} "
                    f"(esempio: {sample_key!r})"
                )
            if game_id is None:
                sample_key = next(iter(self.map_game_code), None)
                print(
                    f"[RecomendationService] game non trovato: "
                    f"ricevuto {game_id} (tipo {type(game_id).__name__}), "
                    f"chiavi del dict di tipo {type(sample_key).__name__} "
                    f"(esempio: {sample_key!r})"
                )
            return None

        tag_list = [1 if tag in game_tags else 0 for tag in self.all_tags]
        user_tensor = torch.tensor([user_id], dtype=torch.long)
        game_tensor = torch.tensor([game_id], dtype=torch.long)

        tag_tensor = torch.tensor([tag_list], dtype=torch.float32)
        with torch.no_grad():
            prediction = self.model(user_tensor, game_tensor, tag_tensor)
            return prediction.item()


_service_instance: RecomendationSystemService | None = None


def get_recomendation_service():
    global _service_instance
    if _service_instance is None:
        _service_instance = RecomendationSystemService()
    return _service_instance
