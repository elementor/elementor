export interface AuthContext {
	userLogin: string;
	appPassword: string;
}

export class WpClient {
	private readonly baseUrl: string;

	constructor(siteUrl: string) {
		this.baseUrl = siteUrl.replace(/\/$/, '') + '/wp-json';
	}

	private authHeader(auth: AuthContext): string {
		const credentials = `${auth.userLogin}:${auth.appPassword}`;
		return 'Basic ' + Buffer.from(credentials).toString('base64');
	}

	async get<T = unknown>(path: string, auth: AuthContext): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		const res = await fetch(url, {
			headers: {
				'Authorization': this.authHeader(auth),
				'Content-Type': 'application/json',
			},
		});

		if (!res.ok) {
			const body = await res.text();
			throw new Error(`WP REST GET ${path} failed (${res.status}): ${body}`);
		}

		return res.json() as Promise<T>;
	}

	async post<T = unknown>(path: string, body: unknown, auth: AuthContext): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		const res = await fetch(url, {
			method: 'POST',
			headers: {
				'Authorization': this.authHeader(auth),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`WP REST POST ${path} failed (${res.status}): ${text}`);
		}

		return res.json() as Promise<T>;
	}

	async put<T = unknown>(path: string, body: unknown, auth: AuthContext): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		const res = await fetch(url, {
			method: 'PUT',
			headers: {
				'Authorization': this.authHeader(auth),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			const text = await res.text();
			throw new Error(`WP REST PUT ${path} failed (${res.status}): ${text}`);
		}

		return res.json() as Promise<T>;
	}
}
