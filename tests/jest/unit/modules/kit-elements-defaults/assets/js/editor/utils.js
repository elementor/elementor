export class MockFetch {
	#fetchMock;

	constructor( baseURL ) {
		this.baseURL = baseURL;
		this.mocks = [];

		this.#fetchMock = this.#makeFetchInstance();
	}

	getFetchMock() {
		return this.#fetchMock;
	}

	get( endpoint ) {
		return this.#addMock( 'GET', endpoint );
	}

	put( endpoint ) {
		return this.#addMock( 'PUT', endpoint );
	}

	delete( endpoint ) {
		return this.#addMock( 'DELETE', endpoint );
	}

	#addMock( method, endpoint ) {
		return {
			reply: ( status, body ) => {
				this.mocks.push( {
					method,
					endpoint,
					response: {
						status,
						body,
					},
				} );

				return this;
			},
		};
	}

	#makeFetchInstance() {
		return jest.fn( ( reqURL, reqOptions ) => {
			const match = this.mocks.find( ( res ) => {
				const isSameMethod = res.method === reqOptions.method;
				const isSameEndpoint = this.#trimURL( this.baseURL + res.endpoint ) === this.#trimURL( reqURL );

				return isSameMethod && isSameEndpoint;
			} );

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

	#trimURL( url ) {
		return url.replace( /\/$/i, '' );
	}
}
