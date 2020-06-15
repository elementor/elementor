// eslint-disable-next-line no-unused-vars
/* global wpApiSettings */

window.wpApiSettings = {
	nonce: 'test_nonce',
};

export const fetchOriginal = $e.data.fetch;

/**
 * @type {[].<{ type, command, callback }>}
 */
export const mockData = [];

/**
 * @param {DataTypes} type
 * @param {string} command
 * @param {function(result, RequestData)} callback
 */
export const mockAdd = ( /*  */ type, command, callback ) => {
	return mockData.push( { type, command, callback } );
};

export const mockClear = () => mockData.splice( 0, mockData.length );

export const mock = () => {
	$e.data.fetch = ( /* RequestData */ requestData, fetchAPI ) => {
		if ( fetchAPI ) {
			return fetchOriginal( requestData, fetchAPI );
		}

		let result;

		mockData.forEach( ( mockObject ) => {
			if ( mockObject.type === requestData.type && mockObject.command === requestData.command ) {
				result = mockObject.callback( result, requestData );
			}
		} );

		if ( undefined !== result ) {
			result = Promise.resolve( result );
		}

		return result;
	};
};

export const cache = () => {
	$e.data.fetch = ( /* RequestData */ requestData, fetchAPI ) => {
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
