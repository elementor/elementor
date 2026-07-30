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

	// Webpack consumed the CommonJS `dist/index.js` through `main`. Its `require()` calls cannot be
	// externalized by Rolldown, which would silently bundle every dependency and leave `.asset.php`
	// without any deps. Every package that ships `dist/index.js` also ships the ESM `dist/index.mjs`
	// built from the same sources, so that is used instead.
	const distEntry = join( packageDir, process.env.ELEMENTOR_PROD_CJS ? 'dist/index.js' : 'dist/index.mjs' );

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
