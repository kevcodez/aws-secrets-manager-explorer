import store from "@/store";

const SETTINGS_KEY_FAVORITES = "favorites";

class FavoriteService {
  favorites: string[] = [];

  constructor() {
    this.favorites = this.loadFavorites();
  }

  markAsFavorite(secret: string) {
    const favorites = this.getFavorites();
    favorites.push(secret);

    this.saveFavorites();
  }

  removeFromFavorites(secret: string) {
    this.favorites = this.favorites.filter(it => it !== secret);

    this.saveFavorites();
  }

  getFavorites(): string[] {
    return this.favorites;
  }

  isFavorite(secretName: string): boolean {
    return this.favorites.includes(secretName);
  }

  private saveFavorites() {
    store.set(SETTINGS_KEY_FAVORITES, this.favorites);
  }

  private loadFavorites(): string[] {
    return (store.get(SETTINGS_KEY_FAVORITES) as string[]) ?? [];
  }
}

export const favoriteService = new FavoriteService();
