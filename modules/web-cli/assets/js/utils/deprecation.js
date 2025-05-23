import Console from 'elementor-api/utils/console';

// Copied from `modules/dev-tools/assets/js/deprecation.js`
/**
 * @typedef {Object} Version
 * @property {number} major1 The first number
 * @property {number} major2 The second number
 * @property {number} minor  The third number
 * @property {string} build  The fourth number
 */

const softDeprecated = ( name, version, replacement ) => {
	if ( elementorWebCliConfig.isDebug ) {
		deprecatedMessage( 'soft', name, version, replacement );
	}
};

const hardDeprecated = ( name, version, replacement ) => {
	deprecatedMessage( 'hard', name, version, replacement );
};

const deprecatedMessage = ( type, name, version, replacement ) => {
	let message = `\`${ name }\` is ${ type } deprecated since ${ version }`;

	if ( replacement ) {
		message += ` - Use \`${ replacement }\` instead`;
	}

	Console.warn( message );
};

export default class Deprecation {
	static deprecated( name, version, replacement ) {
		if ( this.isHardDeprecated( version ) ) {
			hardDeprecated( name, version, replacement );
		} else {
			softDeprecated( name, version, replacement );
		}
	}

	/**
	 * @param {string} version
	 *
	 * @return {Version}
	 */
	static parseVersion( version ) {
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
	}

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
	static getTotalMajor( versionObj ) {
		let total = parseInt( `${ versionObj.major1 }${ versionObj.major2 }0` );

		total = Number( ( total / 10 ).toFixed( 0 ) );

		if ( versionObj.major2 > 9 ) {
			total = versionObj.major2 - 9;
		}

		return total;
	}

	/**
	 * @param {string} version1
	 * @param {string} version2
	 *
	 * @return {number}
	 */
	static compareVersion( version1, version2 ) {
		return [ this.parseVersion( version1 ), this.parseVersion( version2 ) ]
			.map( ( versionObj ) => this.getTotalMajor( versionObj ) )
			.reduce( ( acc, major ) => acc - major );
	}

	/**
	 * @param {string} version
	 *
	 * @return {boolean}
	 */
	static isSoftDeprecated( version ) {
		const total = this.compareVersion( version, elementorWebCliConfig.version );

		return total <= 4;
	}

	/**
	 * @param {string} version
	 * @return {boolean}
	 */
	static isHardDeprecated( version ) {
		const total = this.compareVersion( version, elementorWebCliConfig.version );

		return total < 0 || total >= 8;
	}
}

