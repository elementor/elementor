export const BASE_EXTERNALS = {
	'@wordpress/i18n': 'wp.i18n',
	react: 'React',
	'react-dom': 'ReactDOM',
	'@elementor/app-ui': 'elementorAppPackages.appUi',
	'@elementor/components': 'elementorAppPackages.components',
	'@elementor/hooks': 'elementorAppPackages.hooks',
	'@elementor/site-editor': 'elementorAppPackages.siteEditor',
	'@elementor/router': 'elementorAppPackages.router',
	'@elementor/ui': 'elementorV2.ui',
	'@elementor/icons': 'elementorV2.icons',
	'@elementor/editor-app-bar': 'elementorV2.editorAppBar',
	'@elementor/editor-v1-adapters': 'elementorV2.editorV1Adapters',
	'@elementor/frontend-handlers': 'elementorV2.frontendHandlers',
	'@elementor/alpinejs': 'elementorV2.alpinejs',
	'@elementor/query': 'elementorV2.query',
	'@elementor/onboarding': 'elementorV2.onboarding',
	'@elementor/site-builder': [ 'elementorV2', 'siteBuilder' ],
	'@elementor/v4-activation-modal': [ 'elementorV2', 'v4-activation-modal' ],
	'@elementor/editor-modal-shell': [ 'elementorV2', 'editor-modal-shell' ],
	'@wordpress/dom-ready': 'wp.domReady',
	'@wordpress/components': 'wp.components',
	'@wordpress/core-data': 'wp.coreData',
	'@wordpress/data': 'wp.data',
	'@wordpress/plugins': 'wp.plugins',
	'@wordpress/api-fetch': 'wp.apiFetch',
	'@woocommerce/admin-layout': 'wc.adminLayout',
};

export const ELEMENTOR_SUBPATH_EXTERNAL_PATTERN = /^@elementor\/(ui|icons)\/(.+)$/;

export function resolveElementorSubpathExternal( request ) {
	const matches = request.match( ELEMENTOR_SUBPATH_EXTERNAL_PATTERN );

	if ( ! matches ) {
		return null;
	}

	return `elementorV2.${ matches[ 1 ] }['${ matches[ 2 ] }']`;
}

export function resolveBracketGlobal( value ) {
	if ( Array.isArray( value ) ) {
		return value.reduce( ( expression, part, index ) => index === 0 ? part : `${ expression }['${ part }']`, '' );
	}

	return value;
}

export function createExternalResolver( additionalExternals = {} ) {
	const staticExternals = {
		...BASE_EXTERNALS,
		...additionalExternals,
	};

	return ( id, importer ) => {
		if ( '@reduxjs/toolkit' === id ) {
			if ( importer?.includes( 'vendors-redux.js' ) ) {
				return false;
			}

			return 'elementorVendors.reduxToolkit';
		}

		if ( staticExternals[ id ] ) {
			return resolveBracketGlobal( staticExternals[ id ] );
		}

		return resolveElementorSubpathExternal( id );
	};
}

export function isExternalModule( id, importer ) {
	const resolved = createExternalResolver()( id, importer );
	return resolved !== false && Boolean( resolved );
}

export const PACKAGES_EXTERNAL_MAP = [
	{ request: /^@elementor\/(ui|icons)\/(?!styles$)(.+)$/, handle: 'elementor-v2-$1', global: [ 'elementorV2', '$1', '$2' ] },
	{ request: /^@elementor\/(?!design-tokens|ui\/styles)(.+)$/, handle: 'elementor-v2-$1', global: [ 'elementorV2', '$1' ] },
	{ request: /^@wordpress\/(.+)$/, handle: 'wp-$1', global: [ 'wp', '$1' ] },
	{ request: 'react', handle: 'react', global: 'React' },
	{ request: 'react-dom', handle: 'react-dom', global: 'ReactDOM' },
	{ request: '@reduxjs/toolkit', handle: 'elementor-vendors-redux', global: [ 'elementorVendors', 'reduxToolkit' ] },
	{ request: 'react-redux', handle: 'elementor-vendors-redux', global: [ 'elementorVendors', 'reactRedux' ] },
];

function kebabToCamelCase( value ) {
	return value.replace( /-(\w)/g, ( _, char ) => char.toUpperCase() );
}

function substituteMatch( template, match ) {
	return template.replace( /\$(\d+)/g, ( _, index ) => kebabToCamelCase( match[ Number( index ) ] ?? '' ) );
}

export function resolvePackageGlobal( id ) {
	for ( const item of PACKAGES_EXTERNAL_MAP ) {
		const regex = item.request instanceof RegExp ? item.request : new RegExp( `^${ item.request }$` );
		const match = id.match( regex );

		if ( ! match ) {
			continue;
		}

		if ( typeof item.global === 'string' ) {
			return item.global;
		}

		return item.global
			.map( ( part ) => substituteMatch( part, match ) )
			.reduce( ( expression, part, index ) => index === 0 ? part : `${ expression }.${ part }`, '' );
	}

	return null;
}

export function isPackageExternal( id ) {
	return resolvePackageGlobal( id ) !== null;
}
