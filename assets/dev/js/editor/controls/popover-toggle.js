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

	behaviors() {
		const behaviors = ControlChooseView.prototype.behaviors.apply( this, arguments );

		// We don't want to override existing inherited behaviors, such as dynamic tags
		if ( ! this.options.model.attributes.global ) {
			return behaviors;
		}

		behaviors.globalControlSelect = {
			behaviorClass: GlobalControlSelect,
			popoverTitle: elementor.translate( 'global_text_styles_title' ),
			manageButtonText: elementor.translate( 'manage_global_text_styles' ),
			tooltipText: elementor.translate( 'global_typography_info' ),
			newGlobalConfirmTitle: elementor.translate( 'create_global_color' ),
		};

		return behaviors;
	}

	createGlobalPreviewMarkup( textStyle ) {
		// This method is called without a color parameter when the user clicks the "Add" button
		if ( ! textStyle ) {
			textStyle = this.getTypographyObject();
		}

		const $textStylePreview = jQuery( '<div>', { class: 'e-global-preview e-global-text-style', 'data-elementor-global-name': textStyle.name } );

		$textStylePreview
			.html( textStyle.name )
			.css( { fontFamily, fontSize, fontWeight, transform, fontStyle, textDecoration, lineHeight, letterSpacing } = textStyle );

		return $textStylePreview;
	}

	// TODO: REPLACE THIS PLACEHOLDER OBJECT WITH VALUES OF THE TYPOGRAPHY CONTROLS
	getTypographyObject() {
		return {
			name: 'Primary',
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

		$message.data( 'globalData', this.getTypographyObject() );

		return $message;
	}

	setGlobalValue( textStyleName ) {
		if ( this.getGlobalValue() ) {
			// If a global text style is already active, switch them without disabling globals
			$e.run( 'document/globals/settings', {
				container: elementor.getCurrentElement().getContainer(),
				settings: {
					typography_typography: 'globals/typography/' + textStyleName,
				},
			} );
		} else {
			// If the active text style is NOT a global, enable globals and apply the selected global
			$e.run( 'document/globals/enable', {
				container: elementor.getCurrentElement().getContainer(),
				settings: {
					typography_typography: 'globals/typography/' + textStyleName,
				},
			} );
		}
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

		return await $e.data.get( 'globals/typography' );
	}

	// TODO: Replace placeholders with real global colors
	buildGlobalsList( globalTextStyles ) {
		const $globalTypographyContainer = jQuery( '<div>', { class: 'e-global-previews-container' } );

		globalTextStyles.forEach( ( textStyle ) => {
			const $textStylePreview = this.createGlobalPreviewMarkup( textStyle );

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
