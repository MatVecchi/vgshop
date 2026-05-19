import torch
from torch.utils.data import Dataset


class UserGameInteractionDataset(Dataset):
    def __init__(self, users_id, games_id, tags_per_game, stars, in_lib, targets):
        self.users = torch.tensor(users_id, dtype=torch.long)
        self.games = torch.tensor(games_id, dtype=torch.long)
        self.interests = torch.tensor(
            [
                self._calc_interest(star=stars[i], in_lib=in_lib[i])
                for i in range(len(stars))
            ],
            dtype=torch.float32,
        )

        self.targets = torch.tensor(targets, dtype=torch.float32)
        self.tags_per_game = {
            game_id: torch.tensor(tags, dtype=torch.float32)
            for game_id, tags in tags_per_game.items()
        }

    @staticmethod
    def _calc_interest(star, in_lib, w_stars=5, w_lib=1):
        if star == 0 and in_lib == 0:
            return 0

        star = 3 if star == 0 else star
        norm_stars = (star - 1) / 4
        return (in_lib * w_lib) + (norm_stars * w_stars)

    def __len__(self):
        return len(self.users)

    def __getitem__(self, index):
        user = self.users[index]
        game = self.games[index]
        interest = self.interests[index]
        tags = self.tags_per_game[game.item()]
        target = self.targets[index]

        return user, game, tags, interest, target
