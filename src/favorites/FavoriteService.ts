import store from "@/store";

class FavoriteService {
  markAsFavorite(secret: string) {
    const favorites = this.getFavorites();
    favorites.push(secret);

    this.saveFavorites(favorites);
  }

  removeFromFavorites(secret: string) {
    const favorites = this.getFavorites().filter(it => it !== secret);

    this.saveFavorites(favorites);
  }

  saveFavorites(favorites: string[]) {
    store.set("favorites", favorites);
  }

  getFavorites(): string[] {
    return (store.get("favorites") as string[]) ?? [];
  }

  isFavorite(secretName: string): boolean {
    const favorites = this.getFavorites();

    return favorites.includes(secretName);
  }
}

export const favoriteService = new FavoriteService();
