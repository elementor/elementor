import { createRequire } from 'node:module';

import { WEBPACK_ALIASES } from './paths.mjs';

const require = createRequire( import.meta.url );

/**
 * Reuses the Webpack alias module as the single source of truth so both toolchains, and the
 * Jest config that also reads it, cannot drift apart while they coexist.
 */
export function loadAliases() {
	delete require.cache[ require.resolve( WEBPACK_ALIASES ) ];

	return { ...require( WEBPACK_ALIASES ).resolve.alias };
}
