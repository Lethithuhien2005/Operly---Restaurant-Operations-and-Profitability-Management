export type AppRoute = 'login' | 'signup' | 'prototype';

export function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return 'prototype';
  
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path === '/login' || hash === '#/login' || hash === '#login') {
    return 'login';
  }
  if (
    path === '/signup' ||
    path === '/register' ||
    hash === '#/signup' ||
    hash === '#signup' ||
    hash === '#/register' ||
    hash === '#register'
  ) {
    return 'signup';
  }

  return 'prototype';
}

export function updateBrowserUrl(route: AppRoute): void {
  if (typeof window === 'undefined') return;

  const targetPath = route === 'prototype' ? '/' : `/${route}`;
  const targetHash = route === 'prototype' ? '' : `#/${route}`;

  try {
    window.history.pushState({ route }, '', targetPath);
  } catch {
    // Fallback to hash if pushState fails in certain restricted environments
    window.location.hash = targetHash;
  }
}
