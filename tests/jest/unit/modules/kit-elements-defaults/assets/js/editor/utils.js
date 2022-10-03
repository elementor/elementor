export function mockFetch( baseURL ) {
	const mocks = [];

	const addMock = ( method, endpoint ) => {
		return {
			reply: ( body, status = 200 ) => {
				mocks.push( {
					method,
					endpoint,
					response: {
						status,
						body,
					},
				} );

				return methods;
			},
		};
	};

	const methods = {
		get: ( endpoint ) => addMock( 'GET', endpoint ),
		post: ( endpoint ) => addMock( 'POST', endpoint ),
		put: ( endpoint ) => addMock( 'PUT', endpoint ),
		delete: ( endpoint ) => addMock( 'DELETE', endpoint ),
	};

	window.fetch = makeFetchInstance( baseURL, mocks );

	return methods;
}

function makeFetchInstance( baseURL, mocks ) {
	return jest.fn( ( reqURL, reqOptions ) => {
		const match = mocks.find( ( res ) => (
			res.method === reqOptions.method && baseURL + res.endpoint === reqURL
		) );

		if ( ! match ) {
			return Promise.reject( 'No matching response found' );
		}

		const { status, body } = match.response;

		return Promise.resolve( {
			ok: status >= 200 && status < 300,
			status,
			text: () => Promise.resolve( JSON.stringify( body ) ),
		} );
	} );
}
