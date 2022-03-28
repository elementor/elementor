/**
 * @typedef {Object} Version
 * @property {number} major1
 * @property {number} major2
 * @property {number} minor
 * @property {string} build
 */
export default class extends elementorModules.editor.utils.Module {
	notifyBackendDeprecations() {
		// eslint-disable-next-line camelcase
		const notices = elementor.config.dev_tools.deprecation.soft_notices;

		Object.entries( notices ).forEach( ( [ key, notice ] ) => {
			elementorCommon.helpers.softDeprecated( key, ...notice );
		} );
	}

	/**
	 * @param {string} version
	 *
	 * @return {Version}
	 */
	parseVersion( version ) {
		const versionParts = version.split( '.' ),
			versionPartsLength = versionParts.length;

		if ( versionPartsLength < 3 || versionPartsLength > 4 ) {
			throw new RangeError( 'Invalid Semantic Version string provided' );
		}

		const [ major1, major2, minor ] = versionParts,
			result = {
				major1: parseInt( major1 ),
				major2: parseInt( major2 ),
				minor: parseInt( minor ),
			};

		if ( versionPartsLength > 3 ) {
			result.build = versionParts[ 3 ];
		}

		return result;
	}

	/**
	 * @param {Version} versionObj
	 *
	 * @return {number}
	 */
	getTotalMajor( versionObj ) {
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
	compareVersion( version1, version2 ) {
		const versionObj1 = this.parseVersion( version1 ),
			versionObj2 = this.parseVersion( version2 );

		[ versionObj1, versionObj2 ]
			.forEach( ( version ) => version.total = this.getTotalMajor( version ) );

		return versionObj1.total - versionObj2.total;
	}

	/**
	 * @param {string} version
	 *
	 * @return {boolean}
	 */
	isSoftDeprecated( version ) {
		const total = this.compareVersion( version, elementor.config.dev_tools.deprecation.current_version );

		return total <= elementor.config.dev_tools.deprecation.soft_version_count;
	}

	/**
	 * @param {string} version
	 * @return {boolean}
	 */
	isHardDeprecated( version ) {
		const total = this.compareVersion( version, elementor.config.dev_tools.deprecation.current_version );

		return total >= elementor.config.dev_tools.deprecation.hard_version_count;
	}

	onElementorLoaded() {
		this.notifyBackendDeprecations();
	}
}
