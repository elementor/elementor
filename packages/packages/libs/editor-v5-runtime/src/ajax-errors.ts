export function formatAjaxError( error: unknown ): Error {
	if ( error instanceof Error ) {
		return error;
	}

	if ( typeof error === 'string' && error.length > 0 ) {
		return new Error( error );
	}

	if ( error && typeof error === 'object' ) {
		const record = error as Record< string, unknown >;

		if ( typeof record.message === 'string' && record.message.length > 0 ) {
			return new Error( record.message );
		}

		if ( typeof record.statusText === 'string' && record.statusText.length > 0 ) {
			return new Error( record.statusText );
		}
	}

	return new Error( 'Save failed.' );
}
