/**
 * Ruta home según el rol que viene firmado dentro del JWT.
 * NO considera ubicación — usalo para casos donde no necesitás chequear ciudad/cine.
 */
export function homeForRole(role: string | null | undefined): string {
  if (role === 'admin' || role === 'taquillero') return '/admin';
  return '/cartelera';
}

/**
 * Ruta a la que mandar al usuario justo después de login / register / root.
 * Considera ubicación: si es cliente sin ciudad+cine elegido, va al selector.
 */
export function homeAfterLogin(
  role: string | null | undefined,
  hasLocation: boolean,
): string {
  if (role === 'admin' || role === 'taquillero') return '/admin';
  if (!hasLocation) return '/elegir-cine';
  return '/cartelera';
}
