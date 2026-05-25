'use strict';

import { appendCss, appendJs } from './utils';

async function enqueueAssets( w, utils ) {
	const assets = w.elementorAssetsManager ?? {};

	for ( const handle of assets.styles?.priority_queue ?? {} ) {
		if ( ! assets.styles?.map?.[ handle ] ) {
			continue;
		}
		const { uri, options } = assets.styles.map[ handle ] ?? {};
		await utils.appendCss( handle, uri, options );
	}

	for ( const handle of assets.scripts?.priority_queue ?? {} ) {
		if ( ! assets.scripts?.map?.[ handle ] ) {
			continue;
		}
		const { uri, options } = assets.scripts.map[ handle ] ?? {};
		await utils.appendJs( handle, uri, options );
	}
}

( function( w ) {
	w.addEventListener( 'load', async () => {
		await enqueueAssets( w, { appendCss, appendJs } );
	} );
} )( window );
