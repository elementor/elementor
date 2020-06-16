const ControlChooseView = require( 'elementor-controls/choose' );

export default class ControlPopoverStarterView extends ControlChooseView {
	ui() {
		const ui = ControlChooseView.prototype.ui.apply( this, arguments );

		ui.popoverToggle = '.elementor-control-popover-toggle-toggle';
		ui.resetInput = '.elementor-control-popover-toggle-reset';

		return ui;
	}

	events() {
		return _.extend( ControlChooseView.prototype.events.apply( this, arguments ), {
			'click @ui.popoverToggle': 'onPopoverToggleClick',
		} );
	}

	onPopoverToggleClick() {
		const globalData = this.model.get( 'global' );

		if ( 'typography' === this.model.get( 'groupType' ) && this.ui.popoverToggle.is( ':checked' ) && globalData?.active ) {
			this.triggerMethod( 'unsetGlobalValue' );
		}

		this.$el.next( '.elementor-controls-popover' ).toggle();
	}

	getCommand() {
		return 'globals/typography';
	}

	buildPreviewItemCSS( globalValue ) {
		const cssObject = {};

		Object.entries( globalValue ).forEach( ( [ property, value ] ) => {
			// If a control value is empty, ignore it
			if ( ! value || '' === value.size ) {
				return;
			}

			// TODO: FIGURE OUT WHAT THE FINAL VALUE KEY FORMAT IS AND ADJUST THIS ACCORDINGLY
			if ( property.startsWith( 'styles_' ) ) {
				property = property.replace( 'styles_', '' );
			}

			if ( 'font_size' === property ) {
				// Set max size for Text Style previews in the select popover so it isn't too big
				if ( value.size > 40 ) {
					value.size = 40;
				}
				cssObject.fontSize = value.size + value.unit;
			} else {
				// Convert the snake case property names into camel case to match their corresponding CSS property names
				if ( property.includes( '_' ) ) {
					property = property.replace( /([_][a-z])/g, ( result ) => result.toUpperCase().replace( '_', '' ) );
				}

				cssObject[ property ] = value;
			}
		} );

		return cssObject;
	}

	createGlobalItemMarkup( globalData ) {
		const $textStylePreview = jQuery( '<div>', { class: 'e-global__preview-item e-global__text-style', 'data-global-id': globalData.id } );

		$textStylePreview
			.html( globalData.title )
			.css( this.buildPreviewItemCSS( globalData.value ) );

		return $textStylePreview;
	}

	getGlobalMeta() {
		return {
			commandName: this.getCommand(),
			key: this.model.get( 'name' ),
			title: elementor.translate( 'new_text_style' ),
		};
	}

	getAddGlobalConfirmMessage() {
		const globalData = this.getGlobalMeta(),
			$message = jQuery( '<div>', { class: 'e-global__confirm-message' } ),
			$messageText = jQuery( '<div>' )
				.html( elementor.translate( 'global_typography_confirm_text' ) ),
			$inputWrapper = jQuery( '<div>', { class: 'e-global__confirm-input-wrapper' } ),
			$input = jQuery( '<input>', { type: 'text', name: 'global-name', placeholder: globalData.title } )
				.val( globalData.title );

		$inputWrapper.append( $input );

		$message.append( $messageText, $inputWrapper );

		return $message;
	}

	async getGlobalsList() {
		const result = await $e.data.get( this.getCommand() );

		return result.data;
	}

	buildGlobalsList( globalTextStyles ) {
		const $globalTypographyContainer = jQuery( '<div>', { class: 'e-global__preview-items-container' } );

		Object.values( globalTextStyles ).forEach( ( textStyle ) => {
			// Only build markup if the text style is valid
			if ( textStyle ) {
				const $textStylePreview = this.createGlobalItemMarkup( textStyle );

				$globalTypographyContainer.append( $textStylePreview );
			}
		} );

		return $globalTypographyContainer;
	}

	onAddGlobalButtonClick() {
		this.triggerMethod( 'addGlobalToList', this.getAddGlobalConfirmMessage() );
	}
}

ControlPopoverStarterView.onPasteStyle = ( control, clipboardValue ) => {
	return ! clipboardValue || clipboardValue === control.return_value;
};
