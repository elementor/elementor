const FETCH_TIMEOUT_MS = 10_000;

export async function fetchRenderedHtml( url: string | null ): Promise< string | null > {
	if ( ! url ) {
		return null;
	}

	const timeoutController = new AbortController();
	const timeoutId = setTimeout( () => timeoutController.abort(), FETCH_TIMEOUT_MS );

	try {
		const response = await fetch( url, { credentials: 'omit', signal: timeoutController.signal } );

		if ( ! response.ok ) {
			return null;
		}

		return await response.text();
	} catch {
		return null;
	} finally {
		clearTimeout( timeoutId );
	}
}
