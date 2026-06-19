import torch
from games.models import Game, Tag
from cart.models import Library


def content_based_similarity(target_game: Game, user):
    all_tags = list(Tag.objects.values_list("name", flat=True).order_by("name"))

    target_tags_name = {tag.name for tag in target_game.tag_list.all()}
    target_tags = [1 if tag in target_tags_name else 0 for tag in all_tags]

    target_tags_tensor = torch.tensor(target_tags, dtype=torch.float32)

    not_owned_games = (
        Game.objects.distinct().exclude(id=target_game.id).prefetch_related("tag_list")
    )

    if user.is_authenticated:
        owned = Library.objects.filter(user=user).values_list("game", flat=True)
        not_owned_games = not_owned_games.exclude(id__in=owned)

    not_owned_games = list(not_owned_games)
    if not not_owned_games:
        return []
    
    all_tags_per_game = []

    for game in not_owned_games:
        game_tags_name = {tag.name for tag in game.tag_list.all()}
        game_tags = [1 if tag in game_tags_name else 0 for tag in all_tags]
        all_tags_per_game.append(game_tags)

    all_tags_per_game_tensor = torch.tensor(all_tags_per_game, dtype=torch.float32)

    product = torch.mv(all_tags_per_game_tensor, target_tags_tensor)

    # norma del gioco
    norm_vector = torch.norm(target_tags_tensor)
    # vettore di norme dei giochi
    nomr_matrix = torch.norm(all_tags_per_game_tensor, dim=1)

    norm = norm_vector * nomr_matrix

    max_games = len(not_owned_games)
    k = 10 if max_games>10 else max_games
    cosine_similarity_products = torch.topk(product / (norm + 1e-8), k)
    print(cosine_similarity_products)

    values, indices = cosine_similarity_products
    most_similar_games = [
        not_owned_games[idx.item()]
        for value, idx in zip(values, indices)
        if value.item() >= 0.5
    ]
    return most_similar_games
