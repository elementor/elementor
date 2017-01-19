var ControlBaseMultipleItemView = elementor.modules.controls.MultipleBase,
	ControlBaseUnitsItemView;

ControlBaseUnitsItemView = ControlBaseMultipleItemView.extend( {

	getCurrentRange: function() {
		return this.getUnitRange( this.getControlValue( 'unit' ) );
	},

	getUnitRange: function( unit ) {
		var ranges = this.model.get( 'range' );

		if ( ! ranges || ! ranges[ unit ] ) {
			return false;
		}

		return ranges[ unit ];
	}
} );

module.exports = ControlBaseUnitsItemView;
