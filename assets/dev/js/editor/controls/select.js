var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlSelectItemView;

ControlSelectItemView = ControlBaseDataView.extend( {}, {

	onPasteStyle: function( control, clipboardValue ) {
		if ( control.groups ) {
			return control.groups.some( function( group ) {
				return ControlSelectItemView.onPasteStyle( group, clipboardValue );
			} );
		}

		return undefined !== control.options[ clipboardValue ];
	}
} );

module.exports = ControlSelectItemView;
