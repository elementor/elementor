import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { loadAliases } from '../shared/aliases.mjs';
import { isExternal } from '../shared/externals.mjs';

/**
 * Matches a dynamic `import()` call with a static string specifier. `webpackChunkName` magic
 * comments are skipped over rather than parsed: the transform derives the chunk name from the
 * specifier itself so two call sites that import the same module always resolve to the same
 * chunk, which Webpack achieved through named-chunk grouping. Interpolated specifiers do not
 * match, which is deliberate: the loader indexes by name, so a caller that needs a dynamic name
 * has to build it themselves.
 */
const DYNAMIC_IMPORT = /import\(\s*(?:\/\*[^*]*(?:\*(?!\/)[^*]*)*\*\/\s*)?(['"])([^'"]+)\1\s*\)/g;

const RESOLVE_EXTENSIONS = [ '.js', '.ts', '.jsx', '.tsx' ];

/**
 * The runtime function the transform rewrites `import()` calls to. Defined by
 * `utils/chunk-loader.js`, which the frontend entry imports early so the assignment has run before
 * any handler tries to load.
 */
const LOADER_CALL = '__elementorLoadChunk';

/**
 * Derives a chunk name from an absolute resolved path so that two call sites with the same
 * basename but different targets do not collide. The frontend already keeps files kebab-cased with
 * meaningful parent directories (`handlers/container/shapes` vs `handlers/section/shapes`), which
 * makes this a stable identifier and avoids the class of merged-chunk configuration Webpack
 * papered over with magic comments.
 */
function deriveChunkName( resolvedPath ) {
	const withoutExtension = resolvedPath.replace( /\.(js|ts|jsx|tsx)$/, '' );
	const segments = withoutExtension.split( '/' );
	const parent = segments[ segments.length - 2 ];
	const leaf = segments[ segments.length - 1 ];

	if ( 'index' === leaf && parent ) {
		return parent;
	}

	if ( parent && 'handlers' !== parent && 'src' !== parent ) {
		return `${ parent }-${ leaf }`;
	}

	return leaf;
}

function withExtension( pathname ) {
	if ( existsSync( pathname ) ) {
		return pathname;
	}

	for ( const extension of RESOLVE_EXTENSIONS ) {
		if ( existsSync( pathname + extension ) ) {
			return pathname + extension;
		}
	}

	for ( const extension of RESOLVE_EXTENSIONS ) {
		const indexPath = `${ pathname }/index${ extension }`;

		if ( existsSync( indexPath ) ) {
			return indexPath;
		}
	}

	return null;
}

/**
 * Resolves an import specifier the same way Rolldown will: relative paths against the importer,
 * aliased prefixes against their alias root, anything else is treated as unresolvable here (which
 * is fine, because externals never enter the chunk graph in the first place).
 */
function resolveSpecifier( specifier, importer, aliases ) {
	if ( specifier.startsWith( './' ) || specifier.startsWith( '../' ) ) {
		return withExtension( resolve( dirname( importer ), specifier ) );
	}

	for ( const [ prefix, root ] of Object.entries( aliases ) ) {
		if ( specifier === prefix ) {
			return withExtension( root );
		}

		const scoped = prefix + '/';

		if ( specifier.startsWith( scoped ) ) {
			return withExtension( resolve( root, specifier.slice( scoped.length ) ) );
		}
	}

	return null;
}

/**
 * Rewrites dynamic `import()` calls in the frontend graph to `__elementorLoadChunk()` and records
 * each chunk's absolute source path for a later pass to build as its own bundle.
 *
 * The plugin populates the passed `chunks` map rather than returning it because Rolldown may
 * traverse modules in any order and multiple `transform` calls contribute. The build orchestrator
 * inspects the map after the frontend entry has been built.
 */
export function frontendChunksPlugin( { chunks } ) {
	const aliases = loadAliases();

	return {
		name: 'elementor-frontend-chunks',
		enforce: 'pre',
		transform( code, id ) {
			if ( ! code.includes( 'import(' ) ) {
				return null;
			}

			let didReplace = false;

			const result = code.replace( DYNAMIC_IMPORT, ( match, _quote, specifier ) => {
				if ( isExternal( specifier ) ) {
					return match;
				}

				const resolved = resolveSpecifier( specifier, id, aliases );

				if ( ! resolved ) {
					return match;
				}

				const name = deriveChunkName( resolved );
				const existing = chunks.get( name );

				if ( existing && existing !== resolved ) {
					throw new Error(
						`[frontend-chunks] chunk name "${ name }" resolves to two paths:\n  ${ existing }\n  ${ resolved }`,
					);
				}

				chunks.set( name, resolved );
				didReplace = true;

				return `${ LOADER_CALL }(${ JSON.stringify( name ) })`;
			} );

			return didReplace ? { code: result, map: null } : null;
		},
	};
}
