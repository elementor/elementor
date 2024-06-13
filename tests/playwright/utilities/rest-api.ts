import { request, BrowserContextOptions } from '@playwright/test';

type StorageState = Exclude<BrowserContextOptions['storageState'], undefined>;
async function createWpRestContext( baseURL: string, storageState: StorageState ) {
	return await request.newContext( {
		baseURL,
		storageState,
		extraHTTPHeaders: {
			'X-WP-Nonce': process.env.WP_REST_NONCE[ process.env.TEST_PARALLEL_INDEX ],
		},
	} );
}

export async function createPage( apiContext = null, baseURL: string, storageState: StorageState ) {
	apiContext = apiContext || ( await createWpRestContext( baseURL, storageState ) );

	const id = `${ Date.now() }${ Math.floor( Math.random() * 1000 ) }`;

	const response = await apiContext.post( '/index.php', {
		params: { rest_route: '/wp/v2/pages' },
		data: {
			title: `Elementor test page ${ id }`,
			status: 'publish',
		},
	} );

	return ( await response.json() ).id;
}

export async function deletePage( pageId: string, apiContext = null, baseURL: string, storageState: StorageState ) {
	apiContext = apiContext || ( await createWpRestContext( baseURL, storageState ) );

	await apiContext.delete( '/index.php', {
		params: { rest_route: `/wp/v2/pages/${ pageId }` },
	} );
}

module.exports = {
	createPage,
	deletePage,
};
