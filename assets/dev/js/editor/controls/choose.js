var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlChooseItemView;

ControlChooseItemView = ControlBaseDataView.extend( {
	ui() {
		var ui = ControlBaseDataView.prototype.ui.apply( this, arguments );

		ui.inputs = '[type="radio"]';

		return ui;
	},

	events() {
		return _.extend( ControlBaseDataView.prototype.events.apply( this, arguments ), {
			'mousedown label': 'onMouseDownLabel',
			'click @ui.inputs': 'onClickInput',
			'change @ui.inputs': 'onBaseInputChange',
		} );
	},

	updatePlaceholder() {
		const placeholder = this.getControlPlaceholder();

		if ( ! this.getControlValue() && placeholder ) {
			// Find the input which has value equals to the placeholder (which is the parent's value),
			// and add it a placeholder class, to indicate which value is selected in the parent.
			this.ui.inputs.filter( `[value="${ this.getControlPlaceholder() }"]` )
				.addClass( 'e-choose-placeholder' );
		} else {
			this.ui.inputs.removeClass( 'e-choose-placeholder' );
		}
	},

	onReady() {
		this.updatePlaceholder();
	},

	applySavedValue() {
		const currentValue = this.getControlValue();

		if ( currentValue ) {
			this.ui.inputs.filter( '[value="' + currentValue + '"]' ).prop( 'checked', true );
		} else {
			this.ui.inputs.filter( ':checked' ).prop( 'checked', false );
		}
	},

	onMouseDownLabel( event ) {
		var $clickedLabel = this.$( event.currentTarget ),
			$selectedInput = this.$( '#' + $clickedLabel.attr( 'for' ) );

		$selectedInput.data( 'checked', $selectedInput.prop( 'checked' ) );
	},

	onClickInput( event ) {
		if ( ! this.model.get( 'toggle' ) ) {
			return;
		}

		var $selectedInput = this.$( event.currentTarget );

		if ( $selectedInput.data( 'checked' ) ) {
			$selectedInput.prop( 'checked', false ).trigger( 'change' );
		}
	},

	onBaseInputChange() {
		ControlBaseDataView.prototype.onBaseInputChange.apply( this, arguments );

		this.updatePlaceholder();
	},
}, {

	onPasteStyle( control, clipboardValue ) {
		return '' === clipboardValue || undefined !== control.options[ clipboardValue ];
	},
} );

module.exports = ControlChooseItemView;
