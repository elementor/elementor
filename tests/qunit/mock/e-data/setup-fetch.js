import * as mockClasses from './mock/';

// eslint-disable-next-line no-unused-vars
/* global wpApiSettings */

window.wpApiSettings = {
	nonce: 'test_nonce',
};

export const fetchOriginal = $e.data.fetch;

/**
 * @type {[].<{ type, command, callback }>}
 */
export let mockData = [];

/**
 * @param {DataTypes} type
 * @param {string} command
 * @param {function(result, RequestData)|null} [callback=null]
 */
export const addMock = ( /*  */ type, command, callback = null ) => {
	if ( mockData.find( ( mock ) => mock.type === type && mock.command === command ) ) {
		throw Error( `Mock type: '${ type }', command: '${ command }' is already exist` );
	}

	// Default callback return query and data merged.
	if ( ! callback ) {
		callback = ( result, requestData ) => {
			const { query } = requestData.args,
				{ data } = requestData.args;

			return { ... query, ... data };
		};
	}

	return mockData.push( { type, command, callback } );
};

export const removeMock = ( type, command ) => {
	let result = false;

	mockData = mockData.filter( ( mock ) => {
		if ( type === mock.type && command === mock.command ) {
			result = mock;

			return false;
		}
		return true;
	} );

	return result;
};

export const attachMock = () => {
	$e.data.fetch = ( /* RequestData */ requestData, fetchAPI ) => {
		if ( fetchAPI ) {
			return fetchOriginal( requestData, fetchAPI );
		}

		let result;

		mockData.some( ( mockObject ) => {
			if ( mockObject.type === requestData.type && mockObject.command === requestData.command ) {
				result = mockObject.callback( result, requestData );

				return true;
			}
		} );

		if ( undefined !== result ) {
			result = Promise.resolve( result );
		}

		return result;
	};
};

export const attachCache = () => {
	$e.data.fetch = ( /* RequestData */ requestData, fetchAPI ) => {
		if ( fetchAPI ) {
			return fetchOriginal( requestData, fetchAPI );
		}

		return $e.data.cache.getAsync( requestData );
	};
};

export const restoreFetch = () => {
	$e.data.fetch = fetchOriginal;
};

export const emptyFetch = () => {
	$e.data.fetch = () => Promise.resolve( {} );
};

// Initial mock.
Object.values( mockClasses ).forEach( ( MockClass ) => new MockClass( addMock ) );
