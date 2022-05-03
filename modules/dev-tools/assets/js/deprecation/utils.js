import { consoleWarn } from '../utils';

/**
 * @typedef {Object} Version
 * @property {number} major1
 * @property {number} major2
 * @property {number} minor
 * @property {string} build
 */

export const softDeprecated = ( name, version, replacement ) => {
	if ( elementorDevToolsConfig.isDebug ) {
		deprecatedMessage( 'soft', name, version, replacement );
	}
};

export const hardDeprecated = ( name, version, replacement ) => {
	deprecatedMessage( 'hard', name, version, replacement );
};

export const deprecatedMessage = ( type, name, version, replacement ) => {
	let message = `\`${ name }\` is ${ type } deprecated since ${ version }`;

	if ( replacement ) {
		message += ` - Use \`${ replacement }\` instead`;
	}

	consoleWarn( message );
};

export const deprecated = ( name, version, replacement ) => {
	if ( isSoftDeprecated( version ) ) {
		softDeprecated( name, version, replacement );
	} else if ( isHardDeprecated( version ) ) {
		hardDeprecated( name, version, replacement );
	}
};

/**
 * @param {string} version
 *
 * @return {Version}
 */
export const parseVersion = ( version ) => {
	const versionParts = version.split( '.' );

	if ( versionParts.length < 3 || versionParts.length > 4 ) {
		throw new RangeError( 'Invalid Semantic Version string provided' );
	}

	const [ major1, major2, minor, build = '' ] = versionParts;

	return {
		major1: parseInt( major1 ),
		major2: parseInt( major2 ),
		minor: parseInt( minor ),
		build,
	};
};

/**
 * Get total of major.
 *
 * Since `get_total_major` cannot determine how much really versions between 2.9.0 and 3.3.0 if there is 2.10.0 version for example,
 * versions with major2 more then 9 will be added to total.
 *
 * @param {Version} versionObj
 *
 * @return {number}
 */
export const getTotalMajor = ( versionObj ) => {
	let total = parseInt( `${ versionObj.major1 }${ versionObj.major2 }0` );

	total = Number( ( total / 10 ).toFixed( 0 ) );

	if ( versionObj.major2 > 9 ) {
		total = versionObj.major2 - 9;
	}

	return total;
};

/**
 * @param {string} version1
 * @param {string} version2
 *
 * @return {number}
 */
export const compareVersion = ( version1, version2 ) => {
	return [ parseVersion( version1 ), parseVersion( version2 ) ]
		.map( ( versionObj ) => getTotalMajor( versionObj ) )
		.reduce( ( acc, major ) => acc - major );
};

/**
 * @param {string} version
 *
 * @return {boolean}
 */
export const isSoftDeprecated = ( version ) => {
	const total = compareVersion( version, elementorDevToolsConfig.deprecation.current_version );

	return total <= elementorDevToolsConfig.deprecation.soft_version_count;
};

/**
 * @param {string} version
 * @return {boolean}
 */
export const isHardDeprecated = ( version ) => {
	const total = compareVersion( version, elementorDevToolsConfig.deprecation.current_version );

	return total >= elementorDevToolsConfig.deprecation.hard_version_count;
};
