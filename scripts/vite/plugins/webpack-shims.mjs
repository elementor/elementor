import { resolveFromRoot } from '../shared/paths.mjs';

/**
 * `public-path.js` assigns Webpack's `__webpack_public_path__` free variable so that the Webpack
 * runtime knew which URL to fetch lazy chunks from. IIFE output cannot code split, so every
 * dynamic import is inlined into its entry and nothing is ever fetched at runtime. Left alone the
 * assignment would throw a `ReferenceError` and abort the rest of the entry module, which is what
 * prevented `frontend.js` from ever reaching `window.elementorFrontend = new Frontend()`.
 */
const PUBLIC_PATH_MODULE = resolveFromRoot( 'assets/dev/js/public-path.js' );

export function webpackShimsPlugin() {
	return {
		name: 'elementor-webpack-shims',
		enforce: 'pre',
		load( id ) {
			if ( id.split( '?' )[ 0 ] === PUBLIC_PATH_MODULE ) {
				return 'export {};';
			}

			return null;
		},
	};
}
