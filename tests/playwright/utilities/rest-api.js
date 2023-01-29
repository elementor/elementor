const { request } = require( '@playwright/test' );

async function createWpRestContext() {
    return await request.newContext( {
        baseURL: process.env.BASE_URL,
        storageState: JSON.parse( process.env.STORAGE_STATE ),
        extraHTTPHeaders: {
            'X-WP-Nonce': process.env.WP_REST_NONCE,
        },
    } );
}

async function createPage( apiContext = null ) {
    apiContext = apiContext || ( await createWpRestContext() );

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

async function deletePage( pageId, apiContext = null ) {
    apiContext = apiContext || ( await createWpRestContext() );

    await apiContext.delete( '/index.php', {
        params: { rest_route: `/wp/v2/pages/${ pageId }` },
    } );
}

module.exports = {
    createWpRestContext,
    createPage,
    deletePage,
};
