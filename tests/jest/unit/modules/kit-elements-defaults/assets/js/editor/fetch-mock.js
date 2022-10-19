export class FetchMock {
	#mock;

	constructor( baseURL ) {
		this.baseURL = baseURL;
		this.interceptors = [];

		this.#mock = this.#makeFetchInstance();
	}

	getMock() {
		return this.#mock;
	}

	get( endpoint ) {
		return this.#addInterceptor( 'GET', endpoint );
	}

	put( endpoint ) {
		return this.#addInterceptor( 'PUT', endpoint );
	}

	delete( endpoint ) {
		return this.#addInterceptor( 'DELETE', endpoint );
	}

	#addInterceptor( method, endpoint ) {
		return {
			reply: ( status, body ) => {
				this.interceptors.push( {
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
			const match = this.interceptors.find( ( res ) => {
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
