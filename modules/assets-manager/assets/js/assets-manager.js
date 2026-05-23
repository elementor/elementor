'use strict';

import { appendCss, appendJs } from './utils';

( function( w, utils ) {
	const assets = w.elementorAssetsManager ?? {};

	for ( const { handle, props } of assets.styles ?? {} ) {
		const { uri, options } = props;
		utils.appendCss( handle, uri, options );
	}

	for ( const { handle, props } of assets.scripts ?? {} ) {
		const { uri, options } = props;
		utils.appendJs( handle, uri, options );
	}
} )(
	window,
	{ appendCss, appendJs },
);
