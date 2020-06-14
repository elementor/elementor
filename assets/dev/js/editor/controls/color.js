import ControlBaseDataView from './base-data';
import ColorPicker from '../utils/color-picker';

export default class extends ControlBaseDataView {
	ui() {
		const ui = super.ui();

		ui.pickerContainer = '.elementor-color-picker-placeholder';

		return ui;
	}

	applySavedValue() {
		if ( ! this.colorPicker ) {
			this.initPicker();
		}

		const globalKey = this.getGlobalValue();

		if ( globalKey ) {
			$e.data.get( globalKey )
				.then( ( globalData ) => {
					this.updateClassGlobalValue( globalData.data.value );
					this.applyCurrentValue();
				} );
		} else {
			this.applyCurrentValue();
		}
	}

	applyCurrentValue() {
		if ( this.colorPicker ) {
			this.colorPicker.picker.setColor( this.getControlValue() );
		} else {
			this.initPicker();
		}

		if ( this.globalValue ) {
			this.setGlobalDisplay();
		}
	}

	updateClassGlobalValue( color ) {
		this.globalValue = color;
	}

	getControlValue() {
		return this.globalValue || super.getControlValue();
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
			global: this.model.get( 'global' ),
			onChange: () => this.onPickerChange(),
			onClear: () => this.onPickerClear(),
			onAddButtonClick: () => this.onAddGlobalButtonClick(),
		};

		this.colorPicker = new ColorPicker( options );

		this.addTipsyToPickerButton();

		this.$pickerButton.on( 'click', () => {
			if ( this.getGlobalValue() ) {
				this.triggerMethod( 'unsetGlobalValue' );

				if ( ! this.getControlValue() ) {
					this.setOptions( 'clearButtonActive', false );
				}
			}
		} );

		jQuery( this.colorPicker.picker.getRoot().root ).addClass( 'elementor-control-unit-1 elementor-control-tag-area' );

		if ( ! this.getGlobalValue() && ! this.getControlValue() ) {
			this.$el.addClass( 'e-no-value-color' );
		}
	}

	hidePopover() {
		this.colorPicker.picker.hide();
	}

	addTipsyToPickerButton() {
		this.$pickerButton = jQuery( this.colorPicker.picker.getRoot().button );

		this.$pickerButton.tipsy( {
			title: () => this.getControlValue() ? this.colorPicker.getColorData().value : '',
			offset: 4,
			gravity: () => 's',
		} );
	}

	getGlobalMeta() {
		const colorData = this.colorPicker.getColorData();

		return {
			commandName: 'globals/colors',
			key: this.model.get( 'name' ),
			title: colorData.title,
			value: colorData.value,
		};
	}

	getAddGlobalConfirmMessage( globalColors ) {
		const color = this.colorPicker.getColorData(),
			$message = jQuery( '<div>', { class: 'e-global-confirm-message' } ),
			$messageText = jQuery( '<div>' ),
			$inputWrapper = jQuery( '<div>', { class: 'e-global-confirm-input-wrapper' } ),
			$colorPreview = jQuery( '<div>', { class: 'e-global-color__preview', style: 'background-color: ' + color.value } ),
			$input = jQuery( '<input>', { type: 'text', name: 'global-name', placeholder: color.title } )
				.val( color.title );

		// Check if the color already exists in the global colors, and display an appropriate message
		Object.values( globalColors ).forEach( ( globalColor ) => {
			let messageContent = elementor.translate( 'global_color_confirm_text' );

			if ( color.value === globalColor.value ) {
				messageContent = elementor.translate( 'global_color_already_exists' );
			} else if ( color.title === globalColor.title ) {
				messageContent = elementor.translate( 'global_color_name_already_exists' );
			}

			$messageText.html( messageContent );
		} );

		$inputWrapper.append( $colorPreview, $input );

		$message.append( $messageText, $inputWrapper );

		return $message;
	}

	getCommand() {
		return 'globals/colors';
	}

	createGlobalItemMarkup( globalData ) {
		const $color = jQuery( '<div>', { class: 'e-global-preview e-global-color', 'data-global-id': globalData.id } ),
			$colorPreview = jQuery( '<div>', { class: 'e-global-color__preview', style: 'background-color: ' + globalData.value } ),
			$colorTitle = jQuery( '<span>', { class: 'e-global-color__title' } )
				.html( globalData.title ),
			$colorHex = jQuery( '<span>', { class: 'e-global-color__hex' } )
				.html( globalData.value );

		$color.append( $colorPreview, $colorTitle, $colorHex );

		return $color;
	}

	// TODO: Replace placeholders with real global colors
	async getGlobalsList() {
		const result = await $e.data.get( 'globals/colors' );

		return result.data;
	}

	buildGlobalsList( globalColors ) {
		const $globalColorsPreviewContainer = jQuery( '<div>', { class: 'e-global-previews-container' } );

		Object.values( globalColors ).forEach( ( color ) => {
			if ( ! color.value ) {
				return;
			}

			const $color = this.createGlobalItemMarkup( color );

			$globalColorsPreviewContainer.append( $color );
		} );

		this.ui.$globalColorsPreviewContainer = $globalColorsPreviewContainer;

		return $globalColorsPreviewContainer;
	}

	setOptions( key, value ) {
		const changedState = super.setOptions( key, value );

		if ( ! changedState ) {
			return;
		}

		if ( 'addButtonActive' === key ) {
			this.colorPicker.toggleToolState( '$addButton', value );
		} else if ( 'clearButtonActive' === key ) {
			this.colorPicker.toggleToolState( '$customClearButton', value );
		}

		return this.options;
	}

	// Change the color picker value without triggering Pickr's 'change' event
	setGlobalDisplay() {
		if ( ! this.globalValue ) {
			this.$el.addClass( 'e-no-value-color' );

			return;
		}

		const parsedColor = this.colorPicker.picker._parseLocalColor( this.globalValue );

		this.colorPicker.picker.setHSVA( ...parsedColor.values, false );
	}

	onPickerChange() {
		this.setValue( this.colorPicker.getColor() );

		if ( this.getGlobalValue() ) {
			this.triggerMethod( 'unsetGlobalValue' );
		}

		if ( ! this.isCustom ) {
			this.triggerMethod( 'valueTypeChange' );

			this.isCustom = true;
		}

		if ( ! this.model.get( 'global' ) ) {
			this.setOptions( 'addButtonActive', true );
		}

		this.setOptions( 'clearButtonActive', true );

		if ( this.$el.hasClass( 'e-no-value-color' ) ) {
			this.$el.removeClass( 'e-no-value-color' );
		}
	}

	onPickerClear() {
		if ( this.getGlobalValue() ) {
			this.triggerMethod( 'unsetGlobalValue' );
		} else {
			this.isCustom = false;

			this.triggerMethod( 'valueTypeChange' );
		}

		this.setValue( '' );

		this.$el.addClass( 'e-no-value-color' );

		if ( ! this.model.get( 'global' ) ) {
			this.setOptions( 'addButtonActive', false );
		}

		this.setOptions( 'clearButtonActive', false );

		this.$el
			.find( '.e-global-selected' )
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
		if ( this.colorPicker ) {
			this.colorPicker.destroy();
		}
	}
}
