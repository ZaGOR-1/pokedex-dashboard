import { Badge, type BadgeTone } from '../ui/atoms/Badge';

const typeTones = new Map<string, BadgeTone>([
  ['grass', 'positive'],
  ['bug', 'positive'],
  ['poison', 'violet'],
  ['fairy', 'violet'],
  ['fire', 'orange'],
  ['fighting', 'danger'],
  ['water', 'blue'],
  ['ice', 'blue'],
  ['flying', 'indigo'],
  ['dragon', 'indigo'],
  ['ghost', 'violet'],
  ['psychic', 'violet'],
  ['electric', 'yellow'],
  ['ground', 'brown'],
  ['rock', 'brown'],
]);

export function PokemonTypeList({
  types,
  label,
}: {
  types: readonly string[];
  label: string;
}) {
  return (
    <ul className="type-list" aria-label={label}>
      {types.map((type) => (
        <li key={type} lang="en">
          <Badge tone={typeTones.get(type) ?? 'neutral'}>{type}</Badge>
        </li>
      ))}
    </ul>
  );
}
