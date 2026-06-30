// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function abortPreviousRuns< TArgs extends any[], TReturn >(
	cb: ( abortController: AbortController, ...args: TArgs ) => TReturn
): ( ...args: TArgs ) => TReturn {
	let abortController: AbortController | null = null;

	return ( ...args: TArgs ) => {
		if ( abortController ) {
			abortController.abort();
		}

		abortController = new AbortController();

		return cb( abortController, ...args );
	};
}
