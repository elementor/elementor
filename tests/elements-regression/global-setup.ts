import { request, type FullConfig } from '@playwright/test';
import ApiRequests from '../playwright/assets/api-requests';
import path from 'path';
import { login } from '../playwright/wp-authentication';

async function globalSetup( config: FullConfig ) {
	const { baseURL } = config.projects[ 0 ].use;

	const context = await login( request, process.env.USERNAME || 'admin', process.env.PASSWORD || 'password', baseURL );

	// Save the nonce and storage state in environment variables, to allow use them when creating the API context.
	const response = await context.get( `${ baseURL }/wp-admin/post-new.php` );

	if ( ! response.ok() ) {
		throw new Error( `
				Failed to fetch nonce: ${ response.status() }.
				${ await response.text() }
				${ response.url() }
				TEST_PARALLEL_INDEX: ${ process.env.TEST_PARALLEL_INDEX }
			` );
	}
	const pageText = await response.text();
	const nonceMatch = pageText.match( /var wpApiSettings = .*;/ );
	if ( ! nonceMatch ) {
		throw new Error( `Nonce not found on the page:\n"${ pageText }"` );
	}

	let nonce = nonceMatch[ 0 ];
	nonce = nonce.replace( /^.*"nonce":"([^"]*)".*$/, '$1' );

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

	const apiRequests = new ApiRequests( baseURL, nonce );
	imageIds.push( await apiRequests.createMedia( context, image1 ) );
	imageIds.push( await apiRequests.createMedia( context, image2 ) );

	// Teardown function.
	return async () => {
		await apiRequests.deleteMedia( context, imageIds );
		await apiRequests.cleanUpTestPages( context );
	};
}

export default globalSetup;
