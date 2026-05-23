'use strict';

const cssMap = new Map();
const jsMap = new Map();

export function appendCss( handle, uri, options = {} ) {
	if ( cssMap.has( handle ) ) {
		return cssMap.get( handle );
	}

	const promise = new Promise( ( resolve, reject ) => {
		const link = document.createElement( 'link' );

		link.rel = 'stylesheet';
		link.href = uri;
		link.media = options.media ?? 'all';

		link.onload = resolve;
		link.onerror = reject;

		document.head.appendChild( link );
	} );

	cssMap.set( handle, promise );

	return promise;
}

export function appendJs( handle, uri, options = {} ) {
	if ( jsMap.has( handle ) ) {
		return jsMap.get( handle );
	}

	const promise = new Promise( ( resolve, reject ) => {
		const script = document.createElement( 'script' );

		script.src = uri;
		script.type = 'text/javascript';
		script.async = options.async ?? true;

		script.onload = resolve;
		script.onerror = reject;

		document.body.appendChild( script );
	} );

	jsMap.set( handle, promise );

	return promise;
}
