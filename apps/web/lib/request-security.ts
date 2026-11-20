/** Mitigation for cross-origin requests carrying authenticated cookies.
 * Only the exact public URL of the Route Handler may make POST/PATCH requests.
 * SameSite cookies and database RLS remain necessary, independent protections.
 */
export function verifyMutationOrigin(request:Request): boolean {
  const source = request.headers.get('origin');
  if(!source || source === 'null') return false;
  if(request.headers.get('sec-fetch-site') === 'cross-site') return false;
  try {
    const origin = new URL(source);
    const current = new URL(request.url);
    if(origin.username || origin.password) return false;
    if(origin.pathname !== '/' || origin.search || origin.hash) return false;
    if(origin.protocol !== 'https:' && origin.hostname !== 'localhost') return false;
    return origin.origin === current.origin;
  } catch {
    return false;
  }
}
