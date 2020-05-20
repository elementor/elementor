import GlobalControlSelect from '../../../../../core/kits/assets/js/globals/global-select-behavior';

const ControlChooseView = require( 'elementor-controls/choose' );

export default class ControlPopoverStarterView extends ControlChooseView {
	ui() {
		const ui = ControlChooseView.prototype.ui.apply( this, arguments );

		ui.popoverToggle = '.elementor-control-popover-toggle-toggle';

		return ui;
	}

	events() {
		return _.extend( ControlChooseView.prototype.events.apply( this, arguments ), {
			'click @ui.popoverToggle': 'onPopoverToggleClick',
		} );
	}

	onPopoverToggleClick() {
		this.$el.next( '.elementor-controls-popover' ).toggle();
	}

	createGlobalItemMarkup( textStyle ) {
		// This method is called without a parameter when the user clicks the "Add" button
		if ( ! textStyle ) {
			textStyle = this.getTypographyObject();
		}

		const $textStylePreview = jQuery( '<div>', { class: 'e-global-preview e-global-text-style', 'data-elementor-global-name': textStyle.value } );

		$textStylePreview
			.html( textStyle.name )
			.css( { fontFamily, fontSize, fontWeight, transform, fontStyle, textDecoration, lineHeight, letterSpacing } = textStyle );

		return $textStylePreview;
	}

	// TODO: REPLACE THIS PLACEHOLDER OBJECT WITH VALUES OF THE TYPOGRAPHY CONTROLS
	getNewGlobalData() {
		return {
			name: 'New Style',
			value: 'globals/typography/new-style',
			fontFamily: 'Varela',
			fontSize: '34px',
			fontWeight: 'normal',
			transform: 'none',
			fontStyle: 'normal',
			textDecoration: 'none',
			lineHeight: 'inherit',
			letterSpacing: 'inherit',
		};
	}

	getAddGlobalConfirmMessage() {
		const $message = jQuery( '<div>', { class: 'e-global-confirm-message' } ),
			$messageText = jQuery( '<div>' )
				.html( elementor.translate( 'global_typography_confirm_text' ) ),
			$inputWrapper = jQuery( '<div>', { class: 'e-global-confirm-input-wrapper' } ),
			$input = jQuery( '<input>', { type: 'text', name: 'global-name', placeholder: 'New Text Style' } )
				.val( 'New Text Style' );

		$inputWrapper.append( $input );

		$message.append( $messageText, $inputWrapper );

		return $message;
	}

	setGlobalValue( textStyleName ) {
		let command = '';

		if ( this.getGlobalValue() ) {
			// If a global text style is already active, switch them without disabling globals
			command = 'document/globals/settings';
		} else {
			// If the active text style is NOT a global, enable globals and apply the selected global
			command = 'document/globals/enable';
		}

		$e.run( command, {
			container: elementor.getCurrentElement().getContainer(),
			settings: {
				typography_typography: textStyleName,
			},
		} );
	}

	unsetGlobalValue() {
		$e.run( 'document/globals/disable', {
			container: elementor.getCurrentElement().getContainer(),
			settings: {
				typography_typography: '',
			},
		} );
	}

	// TODO: REPLACE THIS PLACEHOLDER OBJECT WITH THE ACTUAL GLOBALS ONCE THEY EXIST
	async getGlobalsList() {
		return [
			{
				name: 'Primary',
				value: 'globals/typography/primary',
				fontFamily: 'Varela',
				fontSize: '34px',
				fontWeight: 'normal',
				transform: 'none',
				fontStyle: 'normal',
				textDecoration: 'none',
				lineHeight: 'inherit',
				letterSpacing: 'inherit',
			},
			{
				name: 'Secondary',
				value: 'globals/typography/secondary',
				fontFamily: 'Varela',
				fontSize: '28px',
				fontWeight: 'normal',
				transform: 'none',
				fontStyle: 'normal',
				textDecoration: 'none',
				lineHeight: 'inherit',
				letterSpacing: 'inherit',
			},
			{
				name: 'Text',
				value: 'globals/typography/text',
				fontFamily: 'Varela',
				fontSize: '15px',
				fontWeight: 'normal',
				transform: 'none',
				fontStyle: 'normal',
				textDecoration: 'none',
				lineHeight: 'inherit',
				letterSpacing: 'inherit',
			},
			{
				name: 'Accent',
				value: 'globals/typography/accent',
				fontFamily: 'Varela',
				fontSize: '12px',
				fontWeight: 'normal',
				transform: 'none',
				fontStyle: 'normal',
				textDecoration: 'none',
				lineHeight: 'inherit',
				letterSpacing: 'inherit',
			},
		];

		/*const result = await $e.data.get( 'globals/typography' );

		return result.data;*/
	}

	// TODO: Replace placeholders with real global colors
	buildGlobalsList( globalTextStyles ) {
		const $globalTypographyContainer = jQuery( '<div>', { class: 'e-global-previews-container' } );

		globalTextStyles.forEach( ( textStyle ) => {
			const $textStylePreview = this.createGlobalItemMarkup( textStyle );

			$globalTypographyContainer.append( $textStylePreview );
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
