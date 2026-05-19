import torch
from games.models import Game


def content_based_similarit(target_game: Game, all_tags, not_owned_games):
    # ottieni i tag del gioco
    target_tags = [1 if tag in target_game.tag_list else 0 for tag in all_tags]

    target_tags_tensor = torch.tensor(target_tags, dtype=torch.float32)

    all_tags_per_game = [
        [1 if tag in game.tag_list else 0 for tag in all_tags]
        for game in not_owned_games
    ]

    all_tags_per_game_tensor = torch.tensor(all_tags_per_game, dtype=torch.float32)

    product = torch.mv(all_tags_per_game_tensor, target_tags_tensor)

    # numero
    norm_vector = torch.norm(target_tags_tensor)
    # vettore di norme
    nomr_matrix = torch.norm(all_tags_per_game_tensor, dim=1)

    norm = norm_vector * nomr_matrix

    cosine_similarity = torch.topk(product / (norm + 1e-8), 10)
    return cosine_similarity
