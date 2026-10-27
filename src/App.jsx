import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useFetchPhotos } from './hooks/useFetchPhotos';
import { favoritesReducer, getInitialFavorites } from './reducers/favoritesReducer';

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 21-4.35-4.35m2.1-5.15a7.25 7.25 0 1 1-14.5 0 7.25 7.25 0 0 1 14.5 0Z" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20.84 8.61a5.5 5.5 0 0 0-9.78-3.39L12 6.05l.94-.83a5.5 5.5 0 0 1 9.78 3.39c0 3.75-3.35 6.8-8.08 11.39L12 20.5l-2.64-2.5C4.63 15.41 1.28 12.36 1.28 8.61a5.5 5.5 0 0 1 9.78-3.39L12 6.05l.94-.83a5.5 5.5 0 0 1 7.9 3.39Z" />
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-muted" role="status">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-pink-100 border-t-accent" />
      <p className="text-sm">Loading beautiful moments...</p>
    </div>
  );
}

function GalleryCard({ photo, isFavorite, onToggleFavorite }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={`https://picsum.photos/id/${photo.id}/600/450`}
          alt={`Photo by ${photo.author}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <button
          type="button"
          onClick={() => onToggleFavorite(photo.id)}
          aria-label={isFavorite ? `Remove ${photo.author}'s photo from favourites` : `Add ${photo.author}'s photo to favourites`}
          aria-pressed={isFavorite}
          className={`absolute right-3 top-3 rounded-full p-2.5 backdrop-blur-sm transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
            isFavorite ? 'bg-accent text-white' : 'bg-white/90 text-gray-500 hover:text-accent'
          }`}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      </div>
      <div className="flex items-center justify-between px-4 py-4">
        <p className="truncate text-sm font-medium text-ink">{photo.author}</p>
        <span className="ml-3 text-xs text-muted">#{photo.id}</span>
      </div>
    </article>
  );
}

function App() {
  const { photos, loading, error } = useFetchPhotos();
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, dispatch] = useReducer(favoritesReducer, undefined, getInitialFavorites);

  useEffect(() => {
    localStorage.setItem('celebrare-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const filteredPhotos = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return photos;
    return photos.filter((photo) => photo.author.toLowerCase().includes(query));
  }, [photos, searchTerm]);

  const toggleFavorite = useCallback((photoId) => {
    dispatch({ type: 'toggle', photoId });
  }, []);

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">Celebrare</p>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Photo gallery</h1>
              <p className="mt-3 max-w-lg text-base leading-7 text-muted">A little collection of beautiful moments, gathered for you.</p>
            </div>
            <div className="relative w-full md:max-w-xs">
              <label htmlFor="photo-search" className="sr-only">Search by author</label>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                id="photo-search"
                type="search"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by author..."
                className="w-full rounded-full border border-gray-200 bg-canvas py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-accent focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        {loading && <LoadingState />}
        {error && !loading && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        {!loading && !error && filteredPhotos.length === 0 && (
          <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-medium">No photos found</p>
            <p className="mt-2 text-sm text-muted">Try searching for a different author.</p>
          </div>
        )}
        {!loading && !error && filteredPhotos.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {filteredPhotos.map((photo) => (
              <GalleryCard
                key={photo.id}
                photo={photo}
                isFavorite={favorites.includes(photo.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
