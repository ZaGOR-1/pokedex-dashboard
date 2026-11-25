import { StatusMessage } from '../ui/molecules/StatusMessage';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <StatusMessage
      className="route-not-found"
      heading="Сторінку не знайдено"
      headingLevel="h1"
      variant="empty"
    >
      <p>Перевірте адресу або поверніться до списку Pokémon.</p>
      <Link className="back-link" to="/">
        Назад до дашборду
      </Link>
    </StatusMessage>
  );
}
