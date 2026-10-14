export const ensureError = ( error: unknown ) => {
	if ( error instanceof Error ) {
		return error;
	}

	let message: string;
	let cause: unknown = null;

	try {
		message = JSON.stringify( error );
	} catch ( e ) {
		cause = e;
		message = 'Unable to stringify the thrown value';
	}
	return new Error( `Unexpected non-error thrown: ${ message }`, { cause } );
};
