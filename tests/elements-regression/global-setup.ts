import { request, type FullConfig } from '@playwright/test';
import ApiRequests from '../playwright/assets/api-requests';
import path from 'path';
import { fetchNonce, login } from '../playwright/wp-authentication';

async function globalSetup( config: FullConfig ) {
	const { baseURL } = config.projects[ 0 ].use;

	let context = await login( request, process.env.USERNAME || 'admin', process.env.PASSWORD || 'password', baseURL );
	const storageState = await context.storageState();
	await context.dispose();
	context = await request.newContext( { storageState } );
	const nonce = await fetchNonce( context, baseURL );

	const apiRequests = new ApiRequests( baseURL, nonce );

	// Enable unfiltered file uploads to allow SVG uploads using Elementor AJAX endpoint
	await context.post( `${ baseURL }/wp-admin/admin-ajax.php`, {
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		data: new URLSearchParams( {
			action: 'elementor_ajax',
			actions: JSON.stringify( {
				enable_unfiltered_files_upload: {
					action: 'enable_unfiltered_files_upload',
				},
			} ),
			_nonce: nonce,
		} ).toString(),
	} );

	const imageIds = [];
	const image1 = {
		filePath: path.resolve( __dirname, 'assets/test-images/image1.jpg' ),
		title: 'image1',
		extension: 'jpg',
	};
	const image2 = {
		filePath: path.resolve( __dirname, 'assets/test-images/image2.jpg' ),
		title: 'image2',
		extension: 'jpg',
	};
	const svg = {
		filePath: path.resolve( __dirname, 'assets/test-images/alien.svg' ),
		title: 'svg',
		extension: 'svg',
	};

	imageIds.push( await apiRequests.createMedia( context, image1 ) );
	imageIds.push( await apiRequests.createMedia( context, image2 ) );
	imageIds.push( await apiRequests.createMedia( context, svg ) );

	// Teardown function.
	return async () => {
		await apiRequests.deleteMedia( context, imageIds );
		await apiRequests.cleanUpTestPages( context );
	};
}

export default globalSetup;
