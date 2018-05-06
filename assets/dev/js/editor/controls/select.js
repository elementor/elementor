var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlSelectItemView;

ControlSelectItemView = ControlBaseDataView.extend( {}, {

	onPasteStyle: function( control, clipboardValue ) {
		return undefined !== control.options[ clipboardValue ];
	}
} );

module.exports = ControlSelectItemView;
