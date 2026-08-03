import { resolveGlobal } from '../shared/externals.mjs';

/**
 * Matches `import( 'x' )` with a static specifier, in either quote style or a template literal with
 * no interpolation. Interpolated specifiers compile to concatenation and never match.
 */
const STATIC_DYNAMIC_IMPORT = /\bimport\(\s*(["'`])([^"'`$]+)\1\s*\)/g;

/**
 * Rewrites a dynamic import of an external module to the global it is served from.
 *
 * An external is already on the page as its own script tag, so there is nothing to fetch. Webpack
 * turned these into a promise resolving the global; Rolldown cannot express that in IIFE output and
 * instead leaves the bare specifier in place, where the browser fails to resolve it and the promise
 * rejects. `app/modules/onboarding` and `app/modules/site-builder` both reach their `React.lazy`
 * component this way, so the App rendered nothing for either route.
 *
 * The global is wrapped in a promise because callers treat the result as a module namespace, which
 * is exactly what `window.elementorV2.<name>` holds.
 */
export function dynamicExternalsPlugin( { resolve = resolveGlobal } = {} ) {
	return {
		name: 'elementor-dynamic-externals',
		transform( code ) {
			let didReplace = false;

			const result = code.replace( STATIC_DYNAMIC_IMPORT, ( match, _quote, request ) => {
				const global = resolve( request );

				if ( ! global ) {
					return match;
				}

				didReplace = true;

				return `Promise.resolve(${ global })`;
			} );

			return didReplace ? { code: result, map: null } : null;
		},
	};
}
