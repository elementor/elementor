import { resolveFromRoot } from './paths.mjs';

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
	'@elementor/v4-activation-modal': "elementorV2['v4-activation-modal']",
	'@elementor/editor-modal-shell': "elementorV2['editor-modal-shell']",
	'@wordpress/dom-ready': 'wp.domReady',
	'@wordpress/components': 'wp.components',
	'@wordpress/core-data': 'wp.coreData',
	'@wordpress/data': 'wp.data',
	'@wordpress/plugins': 'wp.plugins',
	'@wordpress/api-fetch': 'wp.apiFetch',
	'@woocommerce/admin-layout': 'wc.adminLayout',
	'@reduxjs/toolkit': 'elementorVendors.reduxToolkit',
};

const SUBPATH_EXTERNAL_PATTERN = /^@elementor\/(ui|icons)\/(.+)$/;

/**
 * Requests that a given bundle publishes itself, and so must stay bundled within it.
 *
 * Externals are passed as IIFE arguments and therefore read before the bundle body runs. A bundle
 * that consumes its own global reads it while it is still undefined: `app-packages` was called as
 * `(React, wp.i18n, elementorAppPackages.router)` and threw before reaching the assignment on its
 * own first line, taking the whole App down with it. Webpack tolerated the cycle because its
 * externals were dereferenced lazily on first require.
 *
 * Resolving these to source is equivalent rather than a workaround, because in both cases the source
 * module is the same object as the global: `app/assets/js/router.js` exports the singleton it assigns
 * to `elementorAppPackages.router`, and `vendors-redux` is what publishes the Redux Toolkit global.
 */
const SELF_PUBLISHED_REQUESTS = {
	'app-packages': [ '@elementor/router' ],
	'vendors-redux': [ '@reduxjs/toolkit' ],
};

/**
 * Where a self-published request resolves once it is no longer external. Inert in every other bundle,
 * since a request that stays external is never resolved.
 */
export const SELF_PUBLISHED_ALIASES = {
	'@elementor/router': resolveFromRoot( 'app/assets/js/router.js' ),
};

function resolveSubpathExternal( request ) {
	const matches = request.match( SUBPATH_EXTERNAL_PATTERN );

	return matches ? `elementorV2.${ matches[ 1 ] }['${ matches[ 2 ] }']` : null;
}

export function resolveGlobal( request, bundleName ) {
	if ( SELF_PUBLISHED_REQUESTS[ bundleName ]?.includes( request ) ) {
		return null;
	}

	return BASE_EXTERNALS[ request ] ?? resolveSubpathExternal( request );
}

export function isExternal( request, bundleName ) {
	return null !== resolveGlobal( request, bundleName );
}
