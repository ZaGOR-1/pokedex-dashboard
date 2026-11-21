import { useDashboardStore } from '../app/dashboardStore';
import { selectIsFavorite } from '../app/dashboardSelectors';

interface FavoriteButtonProps {
  pokemonId: number;
  pokemonName: string;
}

export function FavoriteButton({
  pokemonId,
  pokemonName,
}: FavoriteButtonProps) {
  const isFavorite = useDashboardStore((state) =>
    selectIsFavorite(state, pokemonId),
  );
  const addFavorite = useDashboardStore((state) => state.addFavorite);
  const removeFavorite = useDashboardStore((state) => state.removeFavorite);

  return (
    <button
      type="button"
      className="favorite-button"
      aria-pressed={isFavorite}
      aria-label={`${isFavorite ? 'Видалити' : 'Додати'} ${pokemonName} ${isFavorite ? 'з обраного' : 'до обраного'}`}
      onClick={() =>
        isFavorite ? removeFavorite(pokemonId) : addFavorite(pokemonId)
      }
    >
      <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
      <span>{isFavorite ? 'В обраному' : 'До обраного'}</span>
    </button>
  );
}
