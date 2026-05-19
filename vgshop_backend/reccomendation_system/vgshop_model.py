import torch


class VgshopRCNeuralModel(torch.nn.Module):
    NUM_TAGS = 50

    def __init__(self, num_users, num_games):
        super().__init__()

        # TODO: migliora il calcolo della dimensione di embed applicando la formula
        #       per ora regge 10k utenti e 10k giochi

        self.user_embed = torch.nn.Embedding(num_users, 16)
        self.game_embed = torch.nn.Embedding(num_games, 16)

        initial_tensor_size = 16 * 2 + self.NUM_TAGS + 1

        self.network = torch.nn.Sequential(
            torch.nn.Linear(initial_tensor_size, 64),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.2),
            torch.nn.Linear(64, 32),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.2),
            torch.nn.Linear(32, 16),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.2),
            torch.nn.Linear(16, 1),
        )

    def forward(self, user_ids, game_ids, tags_per_game, interests):
        # trasformano il semplice id di game e user in tensori di "feature" nascoste
        # come le caratteristiche e gusti dell'utente
        user_embed_vector = self.user_embed(user_ids)
        game_embed_vector = self.game_embed(game_ids)

        interest_batch = interests.unsqueeze(-1)

        super_vector = torch.concat(
            [user_embed_vector, game_embed_vector, tags_per_game, interest_batch], dim=1
        )
        return self.network(super_vector)
