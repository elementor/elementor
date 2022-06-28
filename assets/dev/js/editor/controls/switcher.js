var ControlBaseDataView = require( 'elementor-controls/base-data' );

module.exports = ControlBaseDataView.extend( {

	setInputValue( input, value ) {
		this.$( input ).prop( 'checked', this.model.get( 'return_value' ) === value );
	},
}, {

	onPasteStyle( control, clipboardValue ) {
		return ! clipboardValue || clipboardValue === control.return_value;
	},
} );
