var ControlBaseDataView = require( 'elementor-controls/base-data' );

module.exports = ControlBaseDataView.extend( {
	setInputValue: function( input, value ) {
		this.$( input ).prop( 'checked', this.model.get( 'return_value' ) === value );
	}
} );
