var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlBaseMultipleItemView;

ControlBaseMultipleItemView = ControlBaseDataView.extend( {

	applySavedValue() {
		var values = this.getControlValue(),
			$inputs = this.$( '[data-setting]' ),
			self = this;

		_.each( values, function( value, key ) {
			var $input = $inputs.filter( function() {
				return key === this.dataset.setting;
			} );

			self.setInputValue( $input, value );
		} );
	},

	getControlValue( key ) {
		var values = this.container.settings.get( this.model.get( 'name' ) );

		if ( ! jQuery.isPlainObject( values ) ) {
			return {};
		}

		if ( key ) {
			var value = values[ key ];

			if ( undefined === value ) {
				value = '';
			}

			return value;
		}

		return elementorCommon.helpers.cloneObject( values );
	},

	/**
	 * @inheritDoc
	 */
	getCleanControlValue( key ) {
		const values = Object.fromEntries(
			Object.entries( this.getControlValue() )
				.filter( ( [ k, v ] ) => {
					return v && this.model.get( 'default' )[ k ] !== v;
				} ),
		);

		if ( key ) {
			return values?.[ key ];
		}

		return Object.keys( values ).length ? values : undefined;
	},

	setValue( key, value ) {
		var values = this.getControlValue();

		if ( 'object' === typeof key ) {
			_.each( key, function( internalValue, internalKey ) {
				values[ internalKey ] = internalValue;
			} );
		} else {
			values[ key ] = value;
		}

		this.setSettingsModel( values );
	},

	updateElementModel( value, input ) {
		var key = input.dataset.setting;

		this.setValue( key, value );
	},
}, {
	// Static methods
	getStyleValue( placeholder, controlValue ) {
		if ( ! _.isObject( controlValue ) ) {
			return ''; // Invalid
		}

		return controlValue[ placeholder.toLowerCase() ];
	},
} );

module.exports = ControlBaseMultipleItemView;
