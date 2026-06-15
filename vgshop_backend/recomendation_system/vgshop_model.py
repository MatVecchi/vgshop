import torch


class VgshopRCNeuralModel(torch.nn.Module):
    EMBED_SIZE = 64

    def __init__(self, num_users, num_games, num_tags):
        super().__init__()

        # TODO: migliora il calcolo della dimensione di embed applicando la formula
        #       per ora regge 10k utenti e 10k giochi

        self.user_embed = torch.nn.Embedding(num_users, self.EMBED_SIZE)
        self.game_embed = torch.nn.Embedding(num_games, self.EMBED_SIZE)

        initial_tensor_size = self.EMBED_SIZE * 2 + num_tags + 1

        self.network = torch.nn.Sequential(
            torch.nn.Linear(initial_tensor_size, 256),
            torch.nn.BatchNorm1d(256),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.3),
            torch.nn.Linear(256, 128),
            torch.nn.BatchNorm1d(128),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.3),
            torch.nn.Linear(128, 64),
            torch.nn.BatchNorm1d(64),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.2),
            torch.nn.Linear(64, 32),
            torch.nn.ReLU(),
            torch.nn.Linear(32, 1),
            torch.nn.Sigmoid(),
        )

        self._init_embeddings()

    # stabilizza maggiormente gli embeddings nelle prime fasi di training
    def _init_embeddings(self):
        torch.nn.init.xavier_uniform_(self.user_embed.weight)
        torch.nn.init.xavier_uniform_(self.game_embed.weight)

    def forward(self, user_ids, game_ids, tags_per_game):
        # trasformano il semplice id di game e user in tensori di "feature" nascoste
        # come le caratteristiche e gusti dell'utente
        user_embed_vector = self.user_embed(user_ids)
        game_embed_vector = self.game_embed(game_ids)

        interaction = torch.sum(
            user_embed_vector * game_embed_vector, dim=1, keepdim=True
        )
        super_vector = torch.cat(
            [user_embed_vector, game_embed_vector, interaction, tags_per_game], dim=1
        )

        return self.network(super_vector)
