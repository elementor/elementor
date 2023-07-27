import fs from 'fs';
import _path from 'path';
import { APIRequest, type APIRequestContext } from '@playwright/test';
import { Image, StorageState } from '../types/types';
const headers = {
	'X-WP-Nonce': process.env.WP_REST_NONCE,
};

export async function createDefaultMedia( request: APIRequestContext, image: Image ) {
	const imagePath = image.filePath ? image.filePath : `../assets/test-images/${ image.title }.${ image.extension }`;
	const response = await request.post( '/index.php', {

		params: { rest_route: '/wp/v2/media' },
		headers,
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
		throw new Error( `
			Failed to create default media: ${ response.status() }.
			${ await response.text() }
		` );
	}

	const { id } = await response.json();

	return id;
}

export async function deleteDefaultMedia( request: APIRequestContext, ids: string[] ) {
	const requests = [];
	for ( const id in ids ) {
		requests.push( request.delete( `/index.php`, {
			headers,
			params: {
				rest_route: `/wp/v2/media/${ ids[ id ] }`,
				force: 1,
			},
		} ) );
	}
	await Promise.all( requests );
}

export async function createApiContext( request: APIRequest,
	options: { storageStateObject: string| StorageState, wpRESTNonce: string, baseURL: string } ) {
	const context = await request.newContext( {
		baseURL: options.baseURL,
		storageState: options.storageStateObject,
		extraHTTPHeaders: {
			'X-WP-Nonce': options.wpRESTNonce,
		},
	} );

	return context;
}
