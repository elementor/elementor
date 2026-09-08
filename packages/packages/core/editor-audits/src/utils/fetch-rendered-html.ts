export async function fetchRenderedHtml( url: string | null ): Promise< string | null > {
	if ( ! url ) {
		return null;
	}

	try {
		const response = await fetch( url, { credentials: 'omit' } );

		if ( ! response.ok ) {
			return null;
		}

		return await response.text();
	} catch {
		return null;
	}
}
