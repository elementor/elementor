import ControlBaseDataView from './base-data';
import ColorPicker from '../utils/color-picker';
import GlobalControlSelect from '../../../../../core/kits/assets/js/globals/global-select-behavior';

export default class extends ControlBaseDataView {
	ui() {
		const ui = super.ui();

		ui.pickerContainer = '.elementor-color-picker-placeholder';

		return ui;
	}

	behaviors() {
		const behaviors = super.behaviors();

		if ( ! this.options.model.attributes.global_settings ) {
			behaviors.globalControlSelect = {
				behaviorClass: GlobalControlSelect,
				popoverTitle: elementor.translate( 'global_colors_title' ),
				manageButtonText: elementor.translate( 'manage_global_colors' ),
				tooltipText: elementor.translate( 'global_colors_info' ),
				newGlobalConfirmTitle: elementor.translate( 'create_global_style' ),
			};
		}

		return behaviors;
	}

	applySavedValue() {
		if ( this.colorPicker ) {
			this.colorPicker.picker.setColor( this.getControlValue() );
		} else {
			this.initPicker();
		}
	}

	initPicker() {
		const controlValue = this.getControlValue(),
			options = {
			picker: {
				el: this.ui.pickerContainer[ 0 ],
				default: controlValue,
				components: {
					opacity: this.model.get( 'alpha' ),
				},
			},
			isGlobalSettings: !! this.model.attributes.global_settings,
			onChange: () => this.onPickerChange(),
			onClear: () => this.onPickerClear(),
			onAddButtonClick: () => this.onAddGlobalButtonClick(),
		};

		this.colorPicker = new ColorPicker( options );

		if ( controlValue ) {
			this.colorPicker.picker.setColor( controlValue );
		}

		this.addTipsyToPickerButton();

		jQuery( this.colorPicker.picker.getRoot().root ).addClass( 'elementor-control-unit-1 elementor-control-tag-area' );
	}

	addTipsyToPickerButton() {
		this.$pickerButton = jQuery( this.colorPicker.picker.getRoot().button );

		this.$pickerButton.tipsy( {
			title: () => this.getControlValue() ? this.getColorData().displayCode : '',
			offset: 4,
			gravity: () => 's',
		} );
	}

	getColorData() {
		const color = this.colorPicker.picker.getColor(),
			colorObject = {};

		colorObject.displayCode = color.toHEXA().toString( 0 );
		// color.a is the transparency percentage. 1 means HEX value and not rgba()
		if ( 1 === color.a ) {
			colorObject.code = colorObject.displayCode;
		} else {
			colorObject.code = color.toRGBA().toString( 0 );
		}

		colorObject.name = this.getColorName( colorObject );

		return colorObject;
	}

	getColorName( colorObject ) {
		//  Check if the display value is HEX or HEXA (HEXA = with transparency)
		const color = 7 < colorObject.displayCode.length ? colorObject.displayCode.slice( 0, 6 ) : colorObject.code;

		return ntc.name( color )[ 1 ];
	}

	setGlobalValue( colorName ) {
		if ( this.getGlobalValue() ) {
			// If a global color is already active, switch them without disabling globals
			$e.run( 'document/globals/settings', {
				container: elementor.getCurrentElement().getContainer(),
				settings: {
					title_color: 'globals/colors/' + colorName,
				},
			} );
		} else {
			// If the active color is NOT a global, enable globals and apply the selected global
			$e.run( 'document/globals/enable', {
				container: elementor.getCurrentElement().getContainer(),
				settings: {
					title_color: 'globals/colors/' + colorName,
				},
			} );
		}
	}

	unsetGlobalValue() {
		$e.run( 'document/globals/disable', {
			container: elementor.getCurrentElement().getContainer(),
			settings: {
				title_color: '',
			},
		} );
	}

	getAddGlobalConfirmMessage( globalColors ) {
		const color = this.getColorData(),
			$message = jQuery( '<div>', { class: 'elementor-global-confirm-message' } ),
			$messageText = jQuery( '<div>' )
				.html( elementor.translate( 'global_color_confirm_text' ) ),
			$inputWrapper = jQuery( '<div>', { class: 'elementor-global-confirm-input-wrapper' } ),
			$colorPreview = jQuery( '<div>', { class: 'elementor-global-color__preview', style: 'background-color: ' + color.code } ),
			$input = jQuery( '<input>', { type: 'text', name: 'global-name', placeholder: color.name } )
				.val( color.name );

		// Check if the color already exists in the global colors, and display an appropriate message
		Object.values( globalColors ).forEach( ( globalColor ) => {
			if ( color.code === globalColor.code ) {
				$messageText.html( elementor.translate( 'global_color_already_exists' ) );
			} else if ( color.name === globalColor.name ) {
				$messageText.html( elementor.translate( 'global_color_name_already_exists' ) );
			}
		} );

		$inputWrapper.append( $colorPreview, $input );

		$message.append( $messageText, $inputWrapper );

		$message.data( 'globalData', color );

		return $message;
	}

	createGlobalPreviewMarkup( color ) {
		// This method is called without a color parameter when the user clicks the "Add" button
		if ( ! color ) {
			color = this.getColorData();
		}

		const $color = jQuery( '<div>', { class: 'elementor-global-preview elementor-global-color', 'data-elementor-global-name': color.name } ),
			$colorPreview = jQuery( '<div>', { class: 'elementor-global-color__preview', style: 'background-color: ' + color.code } ),
			$colorTitle = jQuery( '<span>', { class: 'elementor-global-color__title' } )
				.html( color.name ),
			$colorHex = jQuery( '<span>', { class: 'elementor-global-color__hex' } )
				.html( color.displayCode );

		$color.append( $colorPreview, $colorTitle, $colorHex );

		// Make the name and hex values easily available for the preview in the confirm dialog
		$color.data( 'globalData', color );

		return $color;
	}
	// TODO: Replace placeholders with real global colors
	async getGlobalsList() {
		return {
			Primary: {
				name: 'Primary',
				code: '#4631DA',
				displayCode: '#4631DA',
			},
			Secondary: {
				name: 'Secondary',
				code: '#71D7F7',
				displayCode: '#71D7F7',
			},
			Text: {
				name: 'Text',
				code: '#495157',
				displayCode: '#495157',
			},
			Accent: {
				name: 'Accent',
				code: '#A4AFB7',
				displayCode: '#A4AFB7',
			},
			OrangeRed: {
				name: 'Orange Red',
				code: '#FF650E',
				displayCode: '#FF650E',
			},
			Crimson: {
				name: 'Crimson',
				code: '#F3113A',
				displayCode: '#F3113A',
			},
			GrassGreen: {
				name: 'Grass Green',
				code: '#048647',
				displayCode: '#048647',
			},
		};

		return await $e.data.get( 'globals/colors' );
	}

	buildGlobalsList( globalColors ) {
		const $globalColorsPreviewContainer = jQuery( '<div>', { class: 'elementor-global-previews-container' } );

		Object.values( globalColors ).forEach( ( color ) => {
			const $color = this.createGlobalPreviewMarkup( color );

			$globalColorsPreviewContainer.append( $color );
		} );

		this.ui.$globalColorsPreviewContainer = $globalColorsPreviewContainer;

		return $globalColorsPreviewContainer;
	}

	onPickerChange() {
		if ( this.getGlobalValue() ) {
			this.unsetGlobalValue();

			this.$el.find( '.elementor-global-selected' ).html( elementor.translate( 'custom' ) );
		}

		if ( this.$el.hasClass( 'elementor-invalid-color' ) ) {
			this.$el.removeClass( 'elementor-invalid-color' );
		}

		this.setValue( this.colorPicker.getColor() );
	}

	onPickerClear() {
		this.setValue( '' );

		this.$el.addClass( 'elementor-invalid-color' );

		this.$el
			.find( '.elementor-global-selected' )
			.html( elementor.translate( 'default' ) );
	}

	onAddGlobalButtonClick() {
		this.getGlobalsList().then(
			( globalsList ) => {
				this.triggerMethod( 'addGlobalToList', this.getAddGlobalConfirmMessage( globalsList ) );
			},
			() => {
				// TODO: What to do if this request fails??
			},
		);
	}

	onBeforeDestroy() {
		this.colorPicker.destroy();
	}
}
