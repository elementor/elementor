/**
 * `@elementor/ui/SvgIcon` style deep imports, as used inside `@elementor/icons`.
 * `@elementor/ui/styles` is excluded: it is a self-reference inside `@elementor/ui` and must stay
 * bundled into `ui.js`.
 */
const ELEMENTOR_PATH_IMPORTS = /^@elementor\/(ui|icons)\/(?!styles$)(.+)$/;

/**
 * `design-tokens` is bundled inside UI, and `ui/styles` is the self-reference above.
 */
const ELEMENTOR_PACKAGES = /^@elementor\/(?!design-tokens|ui\/styles)(.+)$/;

const WORDPRESS_PACKAGES = /^@wordpress\/(.+)$/;

const REQUEST_TO_GLOBAL = [
	{ request: ELEMENTOR_PATH_IMPORTS, global: [ 'elementorV2', '$1', '$2' ] },
	{ request: ELEMENTOR_PACKAGES, global: [ 'elementorV2', '$1' ] },
	{ request: WORDPRESS_PACKAGES, global: [ 'wp', '$1' ] },
	{ request: 'react', global: 'React' },
	{ request: 'react-dom', global: 'ReactDOM' },
	{ request: '@reduxjs/toolkit', global: [ 'elementorVendors', 'reduxToolkit' ] },
	{ request: 'react-redux', global: [ 'elementorVendors', 'reactRedux' ] },
];

const REQUEST_TO_HANDLE = [
	{ request: ELEMENTOR_PATH_IMPORTS, handle: 'elementor-v2-$1' },
	{ request: ELEMENTOR_PACKAGES, handle: 'elementor-v2-$1' },
	{ request: WORDPRESS_PACKAGES, handle: 'wp-$1' },
	{ request: 'react', handle: 'react' },
	{ request: 'react-dom', handle: 'react-dom' },
	{ request: '@reduxjs/toolkit', handle: 'elementor-vendors-redux' },
	{ request: 'react-redux', handle: 'elementor-vendors-redux' },
];

export function kebabToCamelCase( value ) {
	return value.replace( /-(\w)/g, ( _, character ) => character.toUpperCase() );
}

function toRegExp( request ) {
	return request instanceof RegExp ? request : new RegExp( `^${ request }$` );
}

function findMatch( map, request ) {
	for ( const item of map ) {
		const pattern = toRegExp( item.request );
		const matches = request.match( pattern );

		if ( matches ) {
			return { item, pattern, matches };
		}
	}

	return null;
}

/**
 * Resolves the `window` path a request is served from, substituting regex backreferences in the
 * configured global and camel casing each captured group, as `replaceGlobal` did.
 */
export function resolvePackageGlobal( request ) {
	const found = findMatch( REQUEST_TO_GLOBAL, request );

	if ( ! found ) {
		return null;
	}

	const { item, matches } = found;
	let segments = Array.isArray( item.global ) ? [ ...item.global ] : [ item.global ];

	matches.forEach( ( value, index ) => {
		segments = segments.map( ( segment ) => segment.replace( `$${ index }`, kebabToCamelCase( value ) ) );
	} );

	return segments.join( '.' );
}

export function resolvePackageHandle( request ) {
	const found = findMatch( REQUEST_TO_HANDLE, request );

	return found ? request.replace( found.pattern, found.item.handle ) : null;
}

export function isPackageExternal( request ) {
	return null !== resolvePackageGlobal( request );
}
