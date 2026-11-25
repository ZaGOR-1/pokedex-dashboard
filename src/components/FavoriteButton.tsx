import { Button } from '../ui/atoms/Button';
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
    <Button
      size="small"
      type="button"
      className="favorite-button"
      aria-pressed={isFavorite}
      aria-label={`Обране: ${pokemonName}`}
      onClick={() =>
        isFavorite ? removeFavorite(pokemonId) : addFavorite(pokemonId)
      }
    >
      <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
      <span>Обране</span>
    </Button>
  );
}
