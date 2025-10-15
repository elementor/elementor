/**
 * Compare two semantic versions.
 *
 * @param {string|number} a - First version to compare
 * @param {string|number} b - Second version to compare
 * @return {number} - Negative if a < b, positive if a > b, zero if equal
 *
 * @example
 * compareVersions('3.9.1', '3.33.0')   // -1 (3.9.1 is older)
 * compareVersions('3.33.1', '3.33.0')  // 1 (3.33.1 is newer)
 * compareVersions('3.33.0', '3.33.0')  // 0 (equal)
 */
const compareVersions = ( a, b ) => {
	const aParts = String( a || '0.0.0' ).split( '.' ).map( Number );
	const bParts = String( b || '0.0.0' ).split( '.' ).map( Number );

	for ( let i = 0; i < Math.max( aParts.length, bParts.length ); i++ ) {
		const aVal = aParts[ i ] || 0;
		const bVal = bParts[ i ] || 0;
		if ( aVal !== bVal ) {
			return aVal - bVal;
		}
	}
	return 0;
};

/**
 * Check if version A is less than version B.
 *
 * @param {string|number} a - First version
 * @param {string|number} b - Second version
 * @return {boolean} - True if a < b
 *
 * @example
 * isVersionLessThan('3.9.1', '3.33.0')  // true
 * isVersionLessThan('3.33.1', '3.33.0') // false
 */
const isVersionLessThan = ( a, b ) => {
	return compareVersions( a, b ) < 0;
};

export {
	compareVersions,
	isVersionLessThan,
};
