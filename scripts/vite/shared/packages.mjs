import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { resolveFromRoot } from './paths.mjs';

const PACKAGES_ROOT = resolveFromRoot( 'packages' );

const PACKAGE_GROUPS = [ 'packages/core', 'packages/libs', 'apps' ];

/**
 * `ui` and `icons` ship prebuilt in node_modules rather than living in the monorepo, but they are
 * still published as `elementorV2` libraries, so they are appended to the scanned set.
 */
const PREBUILT_PACKAGES = [
	{ name: 'ui', path: resolveFromRoot( 'node_modules/@elementor/ui/index.js' ) },
	{ name: 'icons', path: resolveFromRoot( 'node_modules/@elementor/icons/index.js' ) },
];

export const PACKAGES_OUTPUT_DIR = resolveFromRoot( 'assets/js/packages' );

function resolveEntryPath( packageDir, entrySource ) {
	const sourceEntry = join( packageDir, 'src/index.ts' );

	if ( 'src' === entrySource ) {
		return sourceEntry;
	}

	// The CommonJS `dist/index.js` is what Webpack consumed. It is preferred over the ESM
	// `dist/index.mjs` sibling because Rolldown applies Node's ESM-to-CJS interop to a `.mjs`
	// importer, so a default import of a bundled CommonJS dependency yields the whole
	// `module.exports` object rather than `module.exports.default`. `lottie-react`'s UMD build put
	// `default` on `exports`, and the ESM path returned the wrapper object instead of the component,
	// which React then rejected as an invalid element type inside `BackgroundLottie`.
	//
	// The original reason for choosing `.mjs` was that Rolldown could not externalize `require()`
	// calls; `plugins/cjs-externals.mjs` now rewrites them and populates `.asset.php` with the same
	// dependency list either way.
	const distEntry = join( packageDir, 'dist/index.js' );

	if ( existsSync( distEntry ) || ! existsSync( sourceEntry ) ) {
		// A directory with neither entry is not a package, and the caller drops it.
		return distEntry;
	}

	// Falling back to src here builds a mixed graph whose externals cannot all be resolved to a
	// global, which the bundler reports only as "globals option: The function returned `undefined`".
	throw new Error(
		`Missing ${ distEntry }. Run \`npm run build:packages\` before building the production bundles.`,
	);
}

/**
 * Development builds compile the TypeScript sources; production builds prefer each package's
 * prebuilt `dist`.
 */
export function getPackageEntries( entrySource ) {
	const discovered = PACKAGE_GROUPS.flatMap( ( group ) =>
		readdirSync( resolve( PACKAGES_ROOT, group ) )
			.map( ( name ) => ( { name, path: resolveEntryPath( resolve( PACKAGES_ROOT, group, name ), entrySource ) } ) )
			.filter( ( { path } ) => existsSync( path ) ),
	);

	return [ ...discovered, ...PREBUILT_PACKAGES ];
}
