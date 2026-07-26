import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadAliasesFromConfig } from './aliases.mjs';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const ROOT = resolve( __dirname, '../../..' );

export const VITE_JS_OUTPUT = join( ROOT, 'assets/js' );
export const VITE_CSS_OUTPUT = join( ROOT, 'assets/css' );
export const VITE_DATA_OUTPUT = join( ROOT, 'assets/data' );
export const VITE_PLUGIN_OUTPUT = join( ROOT, 'build' );

export { ROOT };

export function resolveFromRoot( ...segments ) {
	return join( ROOT, ...segments );
}

export function loadAliases() {
	return loadAliasesFromConfig();
}
