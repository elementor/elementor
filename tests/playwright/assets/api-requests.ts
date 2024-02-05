import fs from 'fs';
import _path from 'path';
import { APIRequest, type APIRequestContext } from '@playwright/test';
import { Image, StorageState, Post, WpPage } from '../types/types';
import axios from 'axios';
import FormData from 'form-data';
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

async function _delete( request: APIRequestContext, entity: string, id: string ) {
	const response = await request.delete( '/index.php', {
		params: { rest_route: `/wp/v2/${ entity }/${ id }` },
		headers,
	} );

	if ( ! response.ok() ) {
		throw new Error( `
			Failed to delete a ${ entity }: ${ response.status() }.
			${ await response.text() }
		` );
	}
}

export async function deletePost( request: APIRequestContext, postId: string ) {
	await _delete( request, 'posts', postId );
}

export async function deletePage( request: APIRequestContext, pageId: string ) {
	await _delete( request, 'pages', pageId );
}

async function get( request: APIRequestContext, entity: string, status: string = 'publish' ) {
	const response = await request.get( '/index.php', {
		params: {
			rest_route: `/wp/v2/${ entity }`,
			status,
		},
		headers,
	} );

	if ( ! response.ok() ) {
		throw new Error( `
			Failed to get a ${ entity }: ${ response.status() }.
			${ await response.text() }
		` );
	}
	const data = await response.json();
	return data;
}

export async function create( request: APIRequestContext, entity: string, data: Post ) {
	const response = await request.post( '/index.php', {
		params: { rest_route: `/wp/v2/${ entity }` },
		headers,
		multipart: data,
	} );

	if ( ! response.ok() ) {
		throw new Error( `
			Failed to create a ${ entity }: ${ response.status() }.
			${ await response.text() }
		` );
	}
	const { id } = await response.json();

	return id;
}

export async function getPosts( request: APIRequestContext, status: string = 'publish' ) {
	return await get( request, 'posts', status );
}

export async function getPages( request: APIRequestContext, status: string = 'publish' ) {
	return await get( request, 'pages', status );
}

export async function loginApi( user: string, pw: string, url: string ) {
	const data = new FormData();
	data.append( 'log', user );
	data.append( 'pwd', pw );
	data.append( 'wp-submit', 'Log In' );
	data.append( 'redirect_to', `${ url }/wp-admin/` );
	data.append( 'testcookie', '1' );

	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `${ url }/wp-login.php`,
		data,
	};

	const response = await axios.request( config );

	const cookies: Array<{name: string, value: string, domain: string, path: string}> = [];
	const domain = new URL( url );

	response.headers[ 'set-cookie' ].forEach( ( cookie ) => {
		const data1 = cookie.split( ';' )[ 0 ].split( '=' );
		const obj = { name: data1[ 0 ], value: data1[ 1 ], domain: domain.hostname, path: '/' };
		cookies.push( obj );
	} );

	if ( response.status !== 200 ) {
		throw new Error( JSON.stringify( response.data ) );
	}
	return cookies;
}
