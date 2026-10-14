'use strict';

const cssMap = new Map();
const jsMap = new Map();

function jsElementId( handle ) {
	return `${ handle }-js`;
}

function cssElementId( handle ) {
	return `${ handle }-css`;
}

export function appendCss( handle, uri, options = {} ) {
	if ( cssMap.has( handle ) ) {
		return cssMap.get( handle );
	}

	if ( document.getElementById( cssElementId( handle ) ) ) {
		const resolved = Promise.resolve();
		cssMap.set( handle, resolved );
		return resolved;
	}

	const promise = new Promise( ( resolve, reject ) => {
		const link = document.createElement( 'link' );

		link.id = cssElementId( handle );
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

	if ( document.getElementById( jsElementId( handle ) ) ) {
		const resolved = Promise.resolve();
		jsMap.set( handle, resolved );
		return resolved;
	}

	const promise = new Promise( ( resolve, reject ) => {
		const script = document.createElement( 'script' );

		script.id = jsElementId( handle );
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
