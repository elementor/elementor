import { request, type FullConfig } from '@playwright/test';
import ApiRequests from '../playwright/assets/api-requests';
import path from "path";

async function globalSetup( config: FullConfig ) {
	const { baseURL } = config.projects[ 0 ].use;

	const context = await request.newContext();
	await context.post( `${ baseURL }/wp-login.php`, {
		form: {
			log: process.env.USERNAME || 'admin',
			pwd: process.env.PASSWORD || 'password',
			'wp-submit': 'Log In',
			redirect_to: `${ baseURL }/wp-admin/`,
			testcookie: '1',
		},
	} );

	// Save the nonce and storage state in environment variables, to allow use them when creating the API context.
	const response = await context.get( '/wp-admin/post-new.php' );

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
		path: path.resolve( __dirname, 'assets/image1.jpg' ),
		title: 'image1',
		extension: 'jpg',
	};
	const image2 = {
		path: path.resolve( __dirname, 'assets/image2.jpg' ),
		title: 'image2',
		extension: 'jpg',
	};

	const apiRequests = new ApiRequests( nonce );
	imageIds.push( await apiRequests.createDefaultMedia( context, image1 ) );
	imageIds.push( await apiRequests.createDefaultMedia( context, image2 ) );

	// Teardown function.
	return async () => {
		await apiRequests.deleteDefaultMedia( context, imageIds );
		await apiRequests.cleanUpTestPages( context );
	};
}
export default globalSetup;
