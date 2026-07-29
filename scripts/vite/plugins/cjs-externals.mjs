import { resolveGlobal } from '../shared/externals.mjs';

const REQUIRE_CALL_PATTERN = /(^|[^.\w$])require\(\s*(["'])([^"']+)\2\s*\)/g;

/**
 * Rewrites `require()` of external modules to the global they map to.
 *
 * Externals reached through an ESM `import` are resolved by the bundler's globals option, but
 * CommonJS dependencies keep a literal `require` call that would throw in a browser. This happens
 * for `use-sync-external-store` pulled in by react-redux, and for `react-dom/client`, which is not
 * itself mapped and so gets bundled while its inner `require( 'react-dom' )` still needs the
 * global. Webpack routed both through the same externals mechanism; this restores that behaviour.
 *
 * `resolve` selects the global for a request, and `onExternal` is notified of every request that
 * was rewired, so callers that need the full external set (such as `.asset.php` generation) can see
 * the requests that never appeared as chunk imports.
 */
export function cjsExternalsPlugin( { resolve = resolveGlobal, onExternal } = {} ) {
	return {
		name: 'elementor-cjs-externals',
		renderChunk( code ) {
			let didReplace = false;

			const result = code.replace( REQUIRE_CALL_PATTERN, ( match, prefix, _quote, request ) => {
				const global = resolve( request );

				if ( ! global ) {
					return match;
				}

				didReplace = true;
				onExternal?.( request );

				// Reached through globalThis so that a local binding of the same name inside the
				// CommonJS wrapper cannot shadow the global, as happens with react's `var React`.
				return `${ prefix }(globalThis.${ global })`;
			} );

			return didReplace ? { code: result, map: null } : null;
		},
	};
}
