import torch
import random
from torch.utils.data import DataLoader
from vgshop_model import VgshopRCNeuralModel
from user_game_dataset import UserGameInteractionDataset
from torch.utils.data import random_split

NUM_USERS = 200
NUM_GAMES = 200

user_id = [user for user in range(NUM_USERS)]
game_id = [game for game in range(NUM_GAMES)]
tag_per_games = {game: [tag % (game + 1) for tag in range(50)] for game in game_id}
interest_table = []
for user in user_id:
    for game in game_id:
        # Base logica di affinità
        affinity = (user % 2 == 0 and game % 2 == 0) or (user % 2 != 0 and game % 2 != 0)
        
        if affinity:
            # Utente affine: alte probabilità di voto alto e possesso
            star = random.choice([4, 5])
            in_lib = random.choice([0, 1]) # Può averlo in libreria o solo desiderarlo
        else:
            # Utente non affine: voti bassi/medi, difficilmente in libreria
            star = random.choice([1, 2, 3])
            in_lib = random.choices([0, 1], weights=[0.9, 0.1])[0] # 10% di probabilità di errore/acquisto casuale

        interest_table.append([
            user,
            game,
            star,
            in_lib,
            UserGameInteractionDataset._calc_interest(star=star, in_lib=in_lib),
        ])





dataset = UserGameInteractionDataset(
    users_id=[elem[0] for elem in interest_table],
    games_id=[elem[1] for elem in interest_table],
    tags_per_game=tag_per_games,
    stars=[elem[2] for elem in interest_table],
    in_lib=[elem[3] for elem in interest_table],
)

# Esempio: 80% training, 20% test
train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size
train_dataset, test_dataset = random_split(dataset, [train_size, test_size])

# Crea due loader differenti
train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False)

model = VgshopRCNeuralModel(NUM_USERS, NUM_GAMES)
loss_function = torch.nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', patience=2, factor=0.5)

num_epoch = 40
for epoch in range(num_epoch):
    model.train()
    running_loss = 0.0

    for batch in train_loader:
        users, games, tags, targets = batch
        optimizer.zero_grad()

        
        predict_targets = model(users, games, tags)
        predict_targets_flat = predict_targets.squeeze()
        loss = loss_function(predict_targets_flat, targets.float())

        """
        print("\n" + "="*60)
        print(f"{'INDICE':<8} | {'PREDETTO (IA)':<15} | {'REALE (Target)':<15} | {'ERRORE':<10}")
        print("-"*60)

        mostra_primi_n = min(10, len(targets))
        for i in range(mostra_primi_n):
            pred = predict_targets[i].item()
            reale = targets[i].item()
            errore = abs(pred - reale)
            print(f"{i:<8} | {pred:<15.2f} | {reale:<15.1f} | {errore:<10.2f}")

        print("="*60 + "\n... calcolo sul resto del test set in corso ...\n")
        """


        loss.backward()
        optimizer.step()
        running_loss += loss.item()

    epoch_loss = running_loss / len(train_loader)
    scheduler.step(epoch_loss)
    print(f"Epoch [{epoch + 1}/{num_epoch}] - Loss: {epoch_loss:.4f}")

print("Addestramento completato!")



# ==========================================
# PARTE DI TEST / VALUTAZIONE (Scala reale 0-6)
# ==========================================

model.eval()

total_absolute_error = 0.0
total_squared_error = 0.0
correct_predictions = 0
total_samples = 0

print("\n--- VALUTAZIONE METRICHE SUL TEST SET (20%) ---")

# Variabile di controllo per stampare la tabella una sola volta come campione
tabella_stampata = False

with torch.no_grad():
    for batch in test_loader:
        users, games, tags, targets = batch 
        
        # FIX 1: Aggiungi .squeeze() per trasformare l'output da [64, 1] a un vettore piatto [64]
        predict_targets = model(users, games, tags).squeeze()
        
        # Assicuriamoci che anche i target siano un vettore piatto della stessa forma
        targets = targets.float().view_as(predict_targets)
        
        # --- Calcolo delle Metriche ---
        mae = torch.abs(predict_targets - targets)
        total_absolute_error += mae.sum().item()
        
        total_squared_error += ((predict_targets - targets) ** 2).sum().item()
        total_samples += targets.size(0)
        correct_predictions += (mae < 0.5).sum().item()

        # FIX 2: Spostato il blocco di stampa dentro un IF per farlo girare SOLO al primo batch
        if not tabella_stampata:
            print("\n" + "="*60)
            print(f"{'INDICE':<8} | {'PREDETTO (IA)':<15} | {'REALE (Target)':<15} | {'ERRORE':<10}")
            print("-"*60)

            mostra_primi_n = min(10, len(targets))
            for i in range(mostra_primi_n):
                pred = predict_targets[i].item()
                reale = targets[i].item()
                errore = abs(pred - reale)
                print(f"{i:<8} | {pred:<15.2f} | {reale:<15.1f} | {errore:<10.2f}")

            print("="*60 + "\n... calcolo sul resto del test set in corso ...\n")
            tabella_stampata = True

# 3. Calcolo dei vettori medi finali su tutto il test set
final_mae = total_absolute_error / total_samples
final_rmse = (total_squared_error / total_samples) ** 0.5
accuracy_threshold = (correct_predictions / total_samples) * 100

# 4. Mostriamo i risultati a schermo
print("="*60)
print(f"Numero totale di accoppiate Utente-Gioco testate: {total_samples}")
print(f"MAE (Errore Medio Assoluto): {final_mae:.4f}")
print(f"RMSE (Radice Errore Quadratico Medio): {final_rmse:.4f}")
print(f"Accuratezza (Predizioni con scarto < 0.5): {accuracy_threshold:.2f}%")
print("="*60)