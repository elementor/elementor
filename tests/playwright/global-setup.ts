import { request, type FullConfig } from '@playwright/test';
import { cleanUpTestPages, createApiContext, createDefaultMedia, deleteDefaultMedia } from './assets/api-requests';
import { loginApi } from './parallelTest';

async function globalSetup( config: FullConfig ) {
	const { baseURL } = config.projects[ 0 ].use;
	const storageState = await loginApi(
		request,
		process.env.USERNAME || 'admin',
		process.env.PASSWORD || 'password',
		baseURL,
	);

	const imageIds = [];
	const image1 = {
		title: 'image1',
		extension: 'jpg',
	};
	const image2 = {
		title: 'image2',
		extension: 'jpg',
	};

	const apiContext = await createApiContext( request, {
		storageStateObject: storageState,
		baseURL,
	} );

	imageIds.push( await createDefaultMedia( apiContext, image1 ) );
	imageIds.push( await createDefaultMedia( apiContext, image2 ) );

	// Teardown function.
	return async () => {
		await deleteDefaultMedia( apiContext, imageIds );
		await cleanUpTestPages( apiContext );
	};
}
export default globalSetup;
