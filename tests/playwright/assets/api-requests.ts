import { type APIRequestContext } from '@playwright/test';
import { Post } from '../types/types';

export default class ApiRequests {
	private readonly nonce: string;
	constructor( nonce: string ) {
		this.nonce = nonce;
	}

	public async create( request: APIRequestContext, entity: string, data: Post ) {
		const response = await request.post( '/index.php', {
			params: { rest_route: `/wp/v2/${ entity }` },
			headers: {
				'X-WP-Nonce': this.nonce,
			},
			multipart: data,
		} );

		if ( ! response.ok() ) {
			throw new Error( `
				Failed to create a ${ entity }: ${ response.status() }.
				${ await response.text() }
				${ response.url() }
				TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
				NONCE: ${ this.nonce }
			` );
		}
		const { id } = await response.json();

		return id;
	}
}
