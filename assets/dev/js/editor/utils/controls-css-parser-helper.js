export default class ControlsCSSParserHelper {
	/**
	 * Parse size units selectors dictionary
	 *
	 * Check for placeholders in the controlSelector eg {{SIZE}} or {{UNIT}}
	 * and replace it with the corresponding key's value from the control values.
	 *
	 * @since 3.13.0
	 *
	 * @param {string}  unitSelector The selector to parse eg --e-con-grid-template-columns: {{SIZE}}{{UNIT}}
	 * @param {Object}  controlValue The control values eg { unit: 'fr', size: 2 }
	 * @param {Object}  control This control
	 * @param {Object}  controls All controls
	 * @param {Object}  values All Values
	 * @return {string} The parsed value for the CSS eg --e-con-grid-template-columns: 2fr
	 */
	parseSizeUnitsSelectorsDictionary( unitSelector, controlValue, control, controls, values ) {
		const mustacheVariableRegex = /{{(.*?)}}/g;
		return unitSelector.replace( mustacheVariableRegex, ( match, placeholder ) => {
			const keys = placeholder.toLowerCase().split( '.' );
			let value = controlValue;

			if ( keys.length > 1 ) {
				let otherControl = this.findControlByName( control, controls, keys[ 0 ] );
				value = values[ otherControl.name ];
			}

			for ( let i = 0; i < keys.length; i++ ) {
				value = value[ keys[ i ] ];

				if ( value === undefined ) {
					return match;
				}
			}

			return value;
		} );
	}

	findControlByName( control, controls, parserControlName ) {
		if ( control.responsive && controls[ parserControlName ] ) {
			const deviceSuffix = elementor.conditions.getResponsiveControlDeviceSuffix( control.responsive );

			control = _.findWhere( controls, { name: parserControlName + deviceSuffix } ) ??
				_.findWhere( controls, { name: parserControlName } );
		} else {
			control = _.findWhere( controls, { name: parserControlName } );
		}

		return control;
	}
}
