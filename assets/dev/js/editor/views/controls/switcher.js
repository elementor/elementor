var ControlBaseItemView = require( 'elementor-views/controls/base' );

module.exports = ControlBaseItemView.extend( {
	setInputValue: function( input, value ) {
		this.$( input ).prop( 'checked', this.model.get( 'return_value' ) === value );
	}
} );
