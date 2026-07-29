import { resolveGlobal } from '../shared/externals.mjs';

const REQUIRE_CALL_PATTERN = /(^|[^.\w$])require\(\s*(["'])([^"']+)\2\s*\)/g;

/**
 * Rewrites `require()` of external modules to the global they map to.
 *
 * Externals reached through an ESM `import` are resolved by the bundler's globals option, but
 * CommonJS dependencies (such as `use-sync-external-store`, pulled in by react-redux) keep a
 * literal `require` call that would throw in a browser. Webpack routed both through the same
 * externals mechanism; this restores that behaviour.
 */
export function cjsExternalsPlugin() {
	return {
		name: 'elementor-cjs-externals',
		renderChunk( code ) {
			let didReplace = false;

			const result = code.replace( REQUIRE_CALL_PATTERN, ( match, prefix, _quote, request ) => {
				const global = resolveGlobal( request );

				if ( ! global ) {
					return match;
				}

				didReplace = true;

				// Reached through globalThis so that a local binding of the same name inside the
				// CommonJS wrapper cannot shadow the global, as happens with react's `var React`.
				return `${ prefix }(globalThis.${ global })`;
			} );

			return didReplace ? { code: result, map: null } : null;
		},
	};
}
