import fs from 'fs';
import _path from 'path';
import { APIRequest, type APIRequestContext } from '@playwright/test';
import { Image, StorageState, Post, WpPage } from '../types/types';

const headers = () => {
	return {
		'X-WP-Nonce': process.env[ `WP_REST_NONCE_${ process.env.TEST_PARALLEL_INDEX }` ],
	};
};

export async function createDefaultMedia( request: APIRequestContext, image: Image, retry: boolean = true ) {
	const imagePath = image.filePath ? image.filePath : `../assets/test-images/${ image.title }.${ image.extension }`;
	const response = await request.post( '/index.php', {
		params: { rest_route: '/wp/v2/media' },
		headers: headers(),
		multipart: {
			file: fs.createReadStream( _path.resolve( __dirname, imagePath ) ),
			title: image.title,
			status: 'publish',
			description: image.description,
			alt_text: image.alt_text,
			caption: image.caption,
		},
	} );

	if ( ! response.ok() ) {
		if ( retry ) {
			return createDefaultMedia( request, image, false );
		}
		throw new Error( `
			Failed to create default media: ${ response.status() }.
			${ await response.text() }
			${ response.url() }
			TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
		` );
	}

	const { id } = await response.json();

	return id;
}

export async function deleteDefaultMedia( request: APIRequestContext, ids: string[] ) {
	const requests = [];
	for ( const id in ids ) {
		requests.push( request.delete( `/index.php`, {
			headers: headers(),
			params: {
				rest_route: `/wp/v2/media/${ ids[ id ] }`,
				force: 1,
			},
		} ) );
	}
	await Promise.all( requests );
}

export async function cleanUpTestPages( request: APIRequestContext ) {
	const pagesPublished = await getPages( request ),
		pagesDraft = await getPages( request, 'draft' ),
		pages = [ ...pagesPublished, ...pagesDraft ];

	const pageIds = pages
		.filter( ( page: WpPage ) => page.title.rendered.includes( 'Playwright Test Page' ) )
		.map( ( page: WpPage ) => page.id );

	for ( const id of pageIds ) {
		await deletePage( request, id );
	}
}

export async function createApiContext( request: APIRequest,
	options: { storageStateObject: string| StorageState, baseURL: string } ) {
	return await request.newContext( {
		baseURL: options.baseURL,
		storageState: options.storageStateObject,
		extraHTTPHeaders: headers(),
	} );
}

async function _delete( request: APIRequestContext, entity: string, id: string, retry: boolean = true ) {
	const response = await request.delete( '/index.php', {
		params: { rest_route: `/wp/v2/${ entity }/${ id }` },
		headers: headers(),
	} );

	if ( ! response.ok() ) {
		if ( retry ) {
			return _delete( request, entity, id, false );
		}
		throw new Error( `
			Failed to delete a ${ entity }: ${ response.status() }.
			${ await response.text() }
			${ response.url() }
			TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
		` );
	}
}

export async function deletePage( request: APIRequestContext, pageId: string ) {
	await _delete( request, 'pages', pageId );
}

async function get( request: APIRequestContext, entity: string, status: string = 'publish', retry: boolean = true ) {
	const response = await request.get( '/index.php', {
		params: {
			rest_route: `/wp/v2/${ entity }`,
			status,
		},
		headers: headers(),
	} );

	if ( ! response.ok() ) {
		if ( retry ) {
			return get( request, entity, status, false );
		}
		throw new Error( `
			Failed to get a ${ entity }: ${ response.status() }.
			${ await response.text() }
			${ response.url() }
			TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
		` );
	}
	const data = await response.json();
	return data;
}

export async function create( request: APIRequestContext, entity: string, data: Post, retry: boolean = true ) {
	const response = await request.post( '/index.php', {
		params: { rest_route: `/wp/v2/${ entity }` },
		headers: headers(),
		multipart: data,
	} );

	if ( ! response.ok() ) {
		if ( retry ) {
			return create( request, entity, data, false );
		}
		throw new Error( `
		Failed to create a ${ entity }: ${ response.status() }.
		${ await response.text() }
		${ response.url() }
		TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
	` );
	}
	const { id } = await response.json();

	return id;
}

export async function getPages( request: APIRequestContext, status: string = 'publish' ) {
	return await get( request, 'pages', status );
}
