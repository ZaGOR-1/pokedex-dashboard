import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function RouteFocus() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.getElementById('main-content')?.focus();
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
