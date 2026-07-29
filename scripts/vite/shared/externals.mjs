/**
 * Modules that are never bundled; they resolve to a global at runtime instead.
 */
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
	'@elementor/site-builder': 'elementorV2.siteBuilder',
	'@elementor/v4-activation-modal': "elementorV2['v4-activation-modal']",
	'@elementor/editor-modal-shell': "elementorV2['editor-modal-shell']",
	'@wordpress/dom-ready': 'wp.domReady',
	'@wordpress/components': 'wp.components',
	'@wordpress/core-data': 'wp.coreData',
	'@wordpress/data': 'wp.data',
	'@wordpress/plugins': 'wp.plugins',
	'@wordpress/api-fetch': 'wp.apiFetch',
	'@woocommerce/admin-layout': 'wc.adminLayout',
};

const SUBPATH_EXTERNAL_PATTERN = /^@elementor\/(ui|icons)\/(.+)$/;

const REDUX_TOOLKIT_REQUEST = '@reduxjs/toolkit';
const REDUX_TOOLKIT_GLOBAL = 'elementorVendors.reduxToolkit';

/**
 * The vendors-redux entry is the bundle that publishes the Redux Toolkit global, so it is
 * the only place where the request must stay bundled rather than resolve to that global.
 */
const REDUX_TOOLKIT_BUNDLER = 'vendors-redux.js';

function resolveSubpathExternal( request ) {
	const matches = request.match( SUBPATH_EXTERNAL_PATTERN );

	return matches ? `elementorV2.${ matches[ 1 ] }['${ matches[ 2 ] }']` : null;
}

export function resolveGlobal( request, importer ) {
	if ( REDUX_TOOLKIT_REQUEST === request ) {
		return importer?.includes( REDUX_TOOLKIT_BUNDLER ) ? null : REDUX_TOOLKIT_GLOBAL;
	}

	return BASE_EXTERNALS[ request ] ?? resolveSubpathExternal( request );
}

export function isExternal( request, importer ) {
	return null !== resolveGlobal( request, importer );
}
