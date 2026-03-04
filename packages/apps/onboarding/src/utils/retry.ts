export async function withRetry< T >(
	fn: () => Promise< T >,
	maxRetries = 1,
	delayMs = 1000,
): Promise< T > {
	let lastError: Error;

	for ( let attempt = 0; attempt <= maxRetries; attempt++ ) {
		try {
			return await fn();
		} catch ( error ) {
			lastError = error instanceof Error ? error : new Error( String( error ) );

			if ( attempt < maxRetries ) {
				await new Promise( ( r ) => setTimeout( r, delayMs ) );
			}
		}
	}

	throw lastError!;
}
