export function syncKindeTokenToSession(token: string | null) {
  if (token) {
    sessionStorage.setItem('kinde_access_token', token);
  } else {
    sessionStorage.removeItem('kinde_access_token');
  }
}
