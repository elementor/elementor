'use strict';

import { appendCss, appendJs } from './utils';

function enqueueAssets( w, utils ) {
	const assets = w.elementorAssetsManager ?? {};

	for ( const handle of assets.styles?.priority_queue ?? {} ) {
		const { uri, options } = assets.styles?.map?.[ handle ] ?? {};
		utils.appendCss( handle, uri, options );
	}

	for ( const handle of assets.scripts?.priority_queue ?? {} ) {
		const { uri, options } = assets.scripts?.map?.[ handle ] ?? {};
		utils.appendJs( handle, uri, options );
	}
}

( function( w ) {
	w.addEventListener( 'load', () => {
		enqueueAssets( w, { appendCss, appendJs } );
	} );
} )( window );
