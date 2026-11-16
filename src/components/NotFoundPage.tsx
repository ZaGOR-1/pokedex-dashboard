import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="panel empty-state route-not-found">
      <h1>Сторінку не знайдено</h1>
      <p>Перевірте адресу або поверніться до списку Pokémon.</p>
      <Link className="back-link" to="/">
        Назад до дашборду
      </Link>
    </section>
  );
}
