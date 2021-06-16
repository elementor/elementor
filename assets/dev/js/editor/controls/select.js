var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlSelectItemView;

ControlSelectItemView = ControlBaseDataView.extend( {
	updatePlaceholder() {
		const select = this.ui.select;
		let selected = select.find( 'option:selected' );

		if ( '' === selected.val() && ! selected.hasClass( 'e-option-placeholder' ) ) {
			selected = select.find( '.e-option-placeholder' );

			select.val( selected.val() );
		}

		if ( selected.hasClass( 'e-option-placeholder' ) ) {
			select.addClass( 'e-select-placeholder' );
		} else {
			select.removeClass( 'e-select-placeholder' );
		}
	},

	onReady() {
		const placeholder = this.model.get( 'placeholder' );

		if ( placeholder ) {
			jQuery( '<option>' ).val( '' )
				.text( this.model.get( 'options' )[ placeholder ] )
				.addClass( 'e-option-placeholder' )
				.prependTo( this.ui.select );
		}

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
