import { type APIRequestContext } from '@playwright/test';
import { Post } from '../types/types';

const headers = () => {
	return {
		'X-WP-Nonce': process.env[ `WP_REST_NONCE_${ process.env.TEST_PARALLEL_INDEX }` ],
	};
};

export const create = async ( request: APIRequestContext, entity: string, data: Post ) => {
	const response = await request.post( '/index.php', {
		params: { rest_route: `/wp/v2/${ entity }` },
		headers: headers(),
		multipart: data,
	} );

	if ( ! response.ok() ) {
		throw new Error( `
		Failed to create a ${ entity }: ${ response.status() }.
		${ await response.text() }
		${ response.url() }
		TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
	` );
	}
	const { id } = await response.json();

	return id;
};
