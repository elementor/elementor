import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve( dirname( fileURLToPath( import.meta.url ) ), '../../..' );

export function resolveFromRoot( ...segments ) {
	return join( ROOT, ...segments );
}

export const ASSETS_CSS = resolveFromRoot( 'assets/css' );
export const ASSETS_DATA = resolveFromRoot( 'assets/data' );
export const ASSETS_JS = resolveFromRoot( 'assets/js' );
export const ASSETS_PACKAGES_JS = resolveFromRoot( 'assets/js/packages' );
export const BUILD_DIR = resolveFromRoot( 'build' );

export const APP_IMPORTS_SCSS = resolveFromRoot( 'app/assets/styles/app-imports.scss' );
export const BREAKPOINTS_PROXY = resolveFromRoot( 'assets/dev/scss/frontend/breakpoints/proxy.scss' );
export const WEBPACK_ALIASES = resolveFromRoot( '.grunt-config/webpack.alias.js' );
