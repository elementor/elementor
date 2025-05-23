export default function useQueryParams() {
	const urlSearchParams = new URLSearchParams( window.location.search ),
		urlParams = Object.fromEntries( urlSearchParams.entries() ),
		hashValue = location.hash.match( /\?(.+)/ )?.[ 1 ],
		hashParams = {};

	if ( hashValue ) {
		hashValue.split( '&' ).forEach( ( pair ) => {
			const [ key, value ] = pair.split( '=' );

			hashParams[ key ] = value;
		} );
	}

	// Merging the URL params with the hash params.
	const queryParams = {
		...urlParams,
		...hashParams,
	};

	return {
		getAll: () => queryParams,
	};
}
