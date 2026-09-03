export function authConfig(token?: string) {
	return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}
