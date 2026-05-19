import torch
import random
from torch.utils.data import DataLoader
from vgshop_model import VgshopRCNeuralModel
from user_game_dataset import UserGameInteractionDataset

NUM_USERS = 200
NUM_GAMES = 200

user_id = [user for user in range(NUM_USERS)]
game_id = [game for game in range(NUM_GAMES)]
tag_per_games = {game: [tag % (game + 1) for tag in range(50)] for game in game_id}
interest_table = []
for user in user_id:
    for game in game_id:
        # REGOLA LOGICA: Se l'utente e il gioco sono entrambi pari o entrambi dispari,
        # l'utente adora il gioco (5 stelle, è in libreria). Altrimenti no (1 stella, non in lib).
        if (user % 2 == 0 and game % 2 == 0) or (user % 2 != 0 and game % 2 != 0):
            star = 5
            in_lib = 1
        else:
            star = 1
            in_lib = 0

        interest_table.append(
            [
                user,
                game,
                star,
                in_lib,
                UserGameInteractionDataset._calc_interest(star=star, in_lib=in_lib),
            ]
        )


dataset = UserGameInteractionDataset(
    users_id=[elem[0] for elem in interest_table],
    games_id=[elem[1] for elem in interest_table],
    tags_per_game=tag_per_games,
    stars=[elem[2] for elem in interest_table],
    in_lib=[elem[3] for elem in interest_table],
    targets=[elem[4] for elem in interest_table],
)
model = VgshopRCNeuralModel(NUM_USERS, NUM_GAMES)
loss_function = torch.nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
train_loader = DataLoader(dataset, batch_size=64, shuffle=True)

num_epoch = 20
for epoch in range(num_epoch):
    model.train()
    running_loss = 0.0

    for batch in train_loader:
        users, games, tags, interests, targets = batch
        optimizer.zero_grad()

        predict_targets = model(users, games, tags, interests)
        predict_targets_flat = predict_targets.squeeze()
        loss = loss_function(predict_targets_flat, targets.float())

        loss.backward()
        optimizer.step()
        running_loss += loss.item()

    epoch_loss = running_loss / len(train_loader)
    print(f"Epoch [{epoch + 1}/{num_epoch}] - Loss: {epoch_loss:.4f}")

print("Addestramento completato!")

