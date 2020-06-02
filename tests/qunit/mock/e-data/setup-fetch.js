/* global wpApiSettings */

export const fetchOriginal = $e.data.fetch;

window.wpApiSettings = {
	nonce: 'test_nonce',
};

export const mock = () => {
	$e.data.fetch = ( requestData, fetchAPI ) => {
		if ( fetchAPI ) {
			return fetchOriginal( requestData, fetchAPI );
		}

		return $e.data.cache.getAsync( requestData );
	};
};

export const silence = () => {
	$e.data.fetch = () => Promise.resolve( {} );
};

export const free = () => {
	$e.data.fetch = fetchOriginal;
};
