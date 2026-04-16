import type { IncomingMessage } from 'node:http';
import type { AuthContext } from '../lib/wp-client.js';

const WP_SITE_URL = process.env['WP_SITE_URL'] ?? 'http://baba-site-3.local:10008';

export interface IntrospectResponse {
	active: boolean;
	user_id?: number;
	user_login?: string;
	app_password?: string;
}

export async function resolveAuth(req: IncomingMessage): Promise<AuthContext | null> {
	const authHeader = req.headers['authorization'] ?? '';

	if (!authHeader.startsWith('Bearer ')) {
		return null;
	}

	const token = authHeader.slice('Bearer '.length).trim();

	if (!token) {
		return null;
	}

	const introspectUrl = `${WP_SITE_URL.replace(/\/$/, '')}/wp-json/elementor/v1/oauth/introspect`;

	let result: IntrospectResponse;
	try {
		const res = await fetch(introspectUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token }),
		});

		if (!res.ok) {
			console.log('[auth] introspect HTTP error:', res.status, await res.text());
			return null;
		}

		result = (await res.json()) as IntrospectResponse;
		console.log('[auth] introspect result:', JSON.stringify(result));
	} catch (err) {
		console.log('[auth] introspect fetch error:', err);
		return null;
	}

	if (!result.active || !result.user_login || !result.app_password) {
		console.log('[auth] token inactive or missing fields');
		return null;
	}

	return {
		userLogin: result.user_login,
		appPassword: result.app_password,
	};
}
