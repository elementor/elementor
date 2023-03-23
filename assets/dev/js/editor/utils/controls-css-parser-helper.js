export default class ControlsCSSParserHelper {
	/**
	 * Parse size units selectors dictionary
	 *
	 * Check for placeholders in the controlSelector eg {{SIZE}} or {{UNIT}}
	 * and replace it with the corresponding key's value from the control values.
	 *
	 * @since 3.13.0
	 *
	 * @param {string}  constrolSelector The selector to parse eg --e-con-grid-template-columns: {{SIZE}}{{UNIT}}
	 * @param {Object}  controlValues The control values eg { unit: 'fr', size: 2 };
	 * @return {string} The parsed value for the CSS eg --e-con-grid-template-columns: 2fr
	 */
	parseSizeUnitsSelectorsDictionary( constrolSelector, controlValues ) {
		return constrolSelector.replace( /{{(.*?)}}/g, function( match, placeholder ) {
			const keys = placeholder.toLowerCase().split( '.' );
			let value = controlValues;

			for ( let i = 0; i < keys.length; i++ ) {
				value = value[ keys[ i ] ];

				if ( value === undefined ) {
					return match;
				}
			}

			return value;
		} );
	}
}
