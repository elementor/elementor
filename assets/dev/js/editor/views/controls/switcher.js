var ControlBaseView = require( 'elementor-views/controls/base' );

module.exports = ControlBaseView.extend( {
	setInputValue: function( input, value ) {
		// Make sure is string value
		// TODO: Remove in v1.6
		value = '' + value;

		this.$( input ).prop( 'checked', this.model.get( 'return_value' ) === value );
	}
} );
