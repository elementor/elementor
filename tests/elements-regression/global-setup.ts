import { request, type FullConfig } from '@playwright/test';
import ApiRequests from '../playwright/assets/api-requests';
import path from 'path';
import { fetchNonce } from '../playwright/wp-authentication';

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
	const nonce = await fetchNonce( context, baseURL );

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
