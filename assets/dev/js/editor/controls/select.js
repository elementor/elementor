var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlSelectItemView;

ControlSelectItemView = ControlBaseDataView.extend( {
	updatePlaceholder() {
		const select = this.ui.select,
			placeholderOption = select.find( '.e-option-placeholder:selected' );

		if ( placeholderOption.length ) {
			select.addClass( 'e-select-placeholder' );
		} else {
			select.removeClass( 'e-select-placeholder' );
		}
	},

	onReady() {
		this.updatePlaceholder();
	},

	onInputChange() {
		this.updatePlaceholder();
	},
}, {

	onPasteStyle: function( control, clipboardValue ) {
		if ( control.groups ) {
			return control.groups.some( function( group ) {
				return ControlSelectItemView.onPasteStyle( group, clipboardValue );
			} );
		}

		return undefined !== control.options[ clipboardValue ];
	},
} );

module.exports = ControlSelectItemView;
