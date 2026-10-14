import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';

import { APP_IMPORTS_SCSS } from '../shared/paths.mjs';

const STUB_PREFIX = '\0app-scss:';

/**
 * Stylesheets imported from App JavaScript are not bundled. Instead the import is registered
 * in `app-imports.scss`, which the styles pipeline compiles into the App stylesheet, and the
 * JavaScript side receives an empty module.
 */
export function appScssPlugin() {
	return {
		name: 'elementor-app-scss',
		enforce: 'pre',
		async resolveId( source, importer ) {
			if ( ! importer || ! /\.s?css$/i.test( source ) ) {
				return null;
			}

			const resolved = await this.resolve( source, importer, { skipSelf: true } );

			return resolved ? `${ STUB_PREFIX }${ resolved.id }` : null;
		},
		load( id ) {
			if ( ! id.startsWith( STUB_PREFIX ) ) {
				return null;
			}

			registerAppScssImport( id.slice( STUB_PREFIX.length ) );

			return 'export default {};';
		},
	};
}

function registerAppScssImport( stylesheetPath ) {
	if ( ! existsSync( APP_IMPORTS_SCSS ) ) {
		return;
	}

	const importStatement = `@import "${ relative( dirname( APP_IMPORTS_SCSS ), stylesheetPath ).replace( /\\/g, '/' ) }";`;

	if ( ! readFileSync( APP_IMPORTS_SCSS, 'utf8' ).split( '\n' ).includes( importStatement ) ) {
		appendFileSync( APP_IMPORTS_SCSS, `${ importStatement }\n`, 'utf8' );
	}
}
