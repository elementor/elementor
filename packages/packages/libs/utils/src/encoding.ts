export const encodeString = (value: string): string => {
	const encoder = new TextEncoder();
	const bytes = encoder.encode(value);
	let binary = '';

	for (const b of bytes) {
		binary += String.fromCharCode(b);
	}

	return btoa(binary);
};

export const decodeString = <T = string>(value: string, fallback?: T): string | T => {
	try {
		const binary = atob(value);
		const bytes = new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
		const decoder = new TextDecoder();
		return decoder.decode(bytes);
	} catch {
		return fallback ?? '';
	}
};
