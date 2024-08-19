import { chromium, request, type FullConfig } from '@playwright/test';
import ApiRequests from '../playwright/assets/api-requests';
import path from 'path';
import { fetchNonce, login } from '../playwright/wp-authentication';

async function globalSetup( config: FullConfig ) {
	const { baseURL, headless } = config.projects[ 0 ].use;

	let context = await login( request, process.env.USERNAME || 'admin', process.env.PASSWORD || 'password', baseURL );

	const storageState = await context.storageState();
	await context.dispose();
	context = await request.newContext( { storageState } );
	let nonce: string;
	try {
		nonce = await fetchNonce( context, baseURL );
		return nonce;
	} catch ( e ) {
		const browser = await chromium.launch( { headless } );
		const page = await browser.newPage();
		// Experiment
		await page.waitForSelector( 'text=Log In' );
		await page.fill( 'input[name="log"]', process.env.USERNAME || 'admin' );
		await page.fill( 'input[name="pwd"]', process.env.PASSWORD || 'password' );
		await page.click( '#wp-submit' );
		await page.waitForSelector( 'text=Dashboard' );
		nonce = await fetchNonce( context, baseURL );
	}

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
