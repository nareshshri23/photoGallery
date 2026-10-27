export function favoritesReducer(favorites, action) {
  switch (action.type) {
    case 'toggle': {
      return favorites.includes(action.photoId)
        ? favorites.filter((id) => id !== action.photoId)
        : [...favorites, action.photoId];
    }
    default:
      throw new Error(`Unsupported favorites action: ${action.type}`);
  }
}

export function getInitialFavorites() {
  try {
    const storedFavorites = localStorage.getItem('celebrare-favorites');
    const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch {
    return [];
  }
}
