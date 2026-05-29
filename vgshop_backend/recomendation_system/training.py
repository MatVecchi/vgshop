import torch
from torch.utils.data import DataLoader
from recomendation_system.vgshop_model import VgshopRCNeuralModel
from recomendation_system.user_game_dataset import UserGameInteractionDataset
from torch.utils.data import random_split
from cart.models import Library
from reviews.models import Review
from games.models import Game, Tag
from django.db.models import Avg
import pandas as pd
import os
import random


class RecomendationSystemTraining:
    NEGATIVE_MULTIPLIER = 2

    def _generate_real_samples(self):
        all_reviews = (
            Review.objects.values("user", "game")
            .annotate(stars=Avg("stars"))
            .order_by("user")
        )
        reviews_dataframe = pd.DataFrame(list(all_reviews))

        all_library = Library.objects.values("user", "game")
        library_dataframe = pd.DataFrame(list(all_library))
        library_dataframe["in_library"] = 1

        dataframe = pd.merge(
            left=reviews_dataframe,
            right=library_dataframe,
            how="outer",
            on=["user", "game"],
        )

        tags_per_games = Game.objects.values("id", "tag_list")
        self.all_tags = Tag.objects.values_list("name", flat=True).order_by("name")
        total_tags = len(self.all_tags)
        tags_dataframe = pd.DataFrame(list(tags_per_games))
        tags_per_game_dataframe = tags_dataframe.groupby("id")["tag_list"].apply(list)

        tags_per_game_dataframe = tags_per_game_dataframe.apply(
            lambda game_tags: [1 if tag in game_tags else 0 for tag in self.all_tags]
        ).to_frame("tag_list")

        tags_per_game_dataframe = tags_per_game_dataframe.rename(columns={"id": "game"})

        dataframe = pd.merge(
            left=dataframe,
            right=tags_per_game_dataframe,
            how="left",
            left_on="game",
            right_index=True,
        )

        return dataframe, total_tags, tags_per_game_dataframe

    def _generate_negative_samples(
        self, dataframe, tags_per_game_dataframe, total_tags
    ):
        map_game_tags = tags_per_game_dataframe["tag_list"].to_dict()

        all_users = dataframe["user"].unique().tolist()
        all_games = dataframe["game"].unique().tolist()

        all_interactions = set(zip(all_users, all_games))
        negative_multiplier = 10

        negative_samples = []

        for user in all_users:
            user_interaction = len(dataframe[dataframe["user"] == user])
            number_negative_samples = user_interaction * negative_multiplier

            negative_counter = 0
            random_game_attempts = 0
            print(f"generating for {user}")

            while (
                negative_counter < number_negative_samples
                and random_game_attempts < 10000
            ):
                random_game = random.choice(all_games)
                random_game_attempts += 1
                if (user, random_game) not in all_interactions:
                    negative_samples.append(
                        {
                            "user": user,
                            "game": random_game,
                            "in_library": 0,
                            "stars": 0,
                            "tag_list": map_game_tags.get(
                                random_game, [0] * total_tags
                            ),
                        }
                    )
                    negative_counter += 1
                    all_interactions.add((user, random_game))

        if negative_samples:
            negative_dataframe = pd.DataFrame(negative_samples)
            dataframe = pd.concat([dataframe, negative_dataframe], ignore_index=True)
        return dataframe

    def __init__(self):

        print("Generating real samples dataframe...")
        real_samples, total_tags, tags_per_game_dataframe = (
            self._generate_real_samples()
        )
        print("Done !\n")

        print("Generating negative samples dataframe...")
        dataframe = self._generate_negative_samples(
            real_samples, tags_per_game_dataframe, total_tags
        )
        print("Done !\n")

        dataframe = dataframe.sample(frac=1).reset_index(drop=True)

        user_column = dataframe["user"].astype("category")
        self.user_to_code = dict(zip(user_column, user_column.cat.codes))
        dataframe["user"] = user_column.cat.codes

        game_column = dataframe["game"].astype("category")
        self.game_to_code = dict(zip(game_column, game_column.cat.codes))
        dataframe["game"] = game_column.cat.codes

        dataframe["in_library"] = dataframe["in_library"].fillna(0).astype(int)
        dataframe["stars"] = dataframe["stars"].fillna(0).astype(int)

        self.total_tags = total_tags

        print("--- DATAFRAME ---")
        print("\n")
        print(dataframe)
        print("\n")

        dataset = UserGameInteractionDataset(
            users_id=dataframe["user"],
            games_id=dataframe["game"],
            tags_per_game=dataframe["tag_list"],
            stars=dataframe["stars"],
            in_lib=dataframe["in_library"],
        )

        # Esempio: 80% training, 20% test
        train_size = int(0.8 * len(dataset))
        test_size = len(dataset) - train_size
        train_dataset, test_dataset = random_split(dataset, [train_size, test_size])

        # Crea due loader differenti
        self.train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
        self.test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)

        self.model = VgshopRCNeuralModel(
            len(dataframe["user"].unique()), len(dataframe["game"].unique()), total_tags
        )
        self.loss_function = torch.nn.BCELoss()
        self.optimizer = torch.optim.Adam(
            self.model.parameters(), lr=0.001, weight_decay=1e-4
        )
        self.scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
            self.optimizer, mode="min", patience=3, factor=0.5
        )

    def _evaluate(self, loader):
        self.model.eval()
        total_absolute_error = 0.0
        total_squared_error = 0.0
        correct_predictions = 0
        total_samples = 0

        with torch.no_grad():
            for batch in loader:
                users, games, tags, targets = batch
                predictions = self.model(users, games, tags).squeeze()
                targets = targets.float().view_as(predictions)

                mae = torch.abs(predictions - targets)
                total_absolute_error += mae.sum().item()
                total_squared_error += ((predictions - targets) ** 2).sum().item()
                total_samples += targets.size(0)
                correct_predictions += (mae < 0.5).sum().item()

        final_mae = total_absolute_error / total_samples
        final_rmse = (total_squared_error / total_samples) ** 0.5
        accuracy = (correct_predictions / total_samples) * 100
        return final_mae, final_rmse, accuracy

    def _test(self):
        mae, rmse, accuracy = self._evaluate(self.test_loader)

        print("\n" + "=" * 60)
        print("VALUTAZIONE METRICHE SUL TEST SET (20%)")
        print("=" * 60)

        # Print a sample of predictions from the first batch
        self.model.eval()
        with torch.no_grad():
            for batch in self.test_loader:
                users, games, tags, targets = batch
                predictions = self.model(users, games, tags).squeeze()
                targets = targets.float().view_as(predictions)

                print(
                    f"\n{'INDICE':<8} | {'PREDETTO (IA)':<15} | {'REALE (Target)':<15} | {'ERRORE':<10}"
                )
                print("-" * 60)
                for i in range(min(10, len(targets))):
                    pred = predictions[i].item()
                    reale = targets[i].item()
                    errore = abs(pred - reale)
                    print(f"{i:<8} | {pred:<15.4f} | {reale:<15.4f} | {errore:<10.4f}")

        print("\n" + "=" * 60)
        print(f"MAE  (Errore Medio Assoluto):           {mae:.4f}")
        print(f"RMSE (Radice Errore Quadratico Medio):  {rmse:.4f}")
        print(f"Accuratezza (scarto < 0.5):             {accuracy:.2f}%")
        print("=" * 60)

    def _train(self):
        num_epochs = 40
        best_val_loss = float("inf")
        patience = 7
        epochs_without_improvement = 0

        print(
            f"\n{'Epoch':<8} {'Train Loss':<14} {'Val MAE':<12} {'Val RMSE':<12} {'LR'}"
        )
        print("-" * 60)

        for epoch in range(num_epochs):
            self.model.train()
            running_loss = 0.0

            for batch in self.train_loader:
                users, games, tags, targets = batch
                self.optimizer.zero_grad()

                predictions = self.model(users, games, tags).squeeze()
                loss = self.loss_function(predictions, targets.float())

                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                self.optimizer.step()
                running_loss += loss.item()

            epoch_loss = running_loss / len(self.train_loader)
            val_mae, val_rmse, val_acc = self._evaluate(self.test_loader)

            current_lr = self.optimizer.param_groups[0]["lr"]
            print(
                f"{epoch + 1:<8} {epoch_loss:<14.4f} {val_mae:<12.4f} {val_rmse:<12.4f} {current_lr:.2e}"
            )

            self.scheduler.step(val_mae)

            if val_mae < best_val_loss:
                best_val_loss = val_mae
                epochs_without_improvement = 0
                torch.save(self.model.state_dict(), "_best_checkpoint.pt")
            else:
                epochs_without_improvement += 1
                if epochs_without_improvement >= patience:
                    print(
                        f"\nEarly stopping at epoch {epoch + 1} (no improvement for {patience} epochs)"
                    )
                    break

        if os.path.exists("_best_checkpoint.pt"):
            self.model.load_state_dict(torch.load("_best_checkpoint.pt"))
            os.remove("_best_checkpoint.pt")
            print("Restored best model weights.")

        print("\nAddestramento completato!")

    def save_model(self):
        saved_models_dir = "recomendation_system/saved_models"
        os.makedirs(saved_models_dir, exist_ok=True)
        percorso_modello_completo = os.path.join(
            saved_models_dir, "vgshop_model_trained.pt"
        )

        complete_model = {
            "model": self.model.state_dict(),
            "user_to_code": self.user_to_code,
            "game_to_code": self.game_to_code,
            "total_tags": self.total_tags,
            "all_tags": list(self.all_tags),
        }

        torch.save(complete_model, percorso_modello_completo)
        print(f"Modello completo salvato con successo in: {percorso_modello_completo}")

    def start_training_session(self):
        self._train()
        self._test()
