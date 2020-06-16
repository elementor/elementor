import ControlBaseDataView from './base-data';
import ColorPicker from '../utils/color-picker';

export default class extends ControlBaseDataView {
	ui() {
		const ui = super.ui();

		ui.pickerContainer = '.elementor-color-picker-placeholder';

		return ui;
	}

	applySavedValue() {
		const currentValue = this.getCurrentValue();

		if ( this.colorPicker ) {
			// Set the picker color without triggering the 'onChange' event
			const parsedColor = this.colorPicker.picker._parseLocalColor( currentValue );

			this.colorPicker.picker.setHSVA( ...parsedColor.values, false );
		} else {
			this.initPicker();
		}

		this.$el.toggleClass( 'e-no-value-color', ! currentValue );
	}

	initPicker() {
		const options = {
			picker: {
				el: this.ui.pickerContainer[ 0 ],
				default: this.getCurrentValue(),
				components: {
					opacity: this.model.get( 'alpha' ),
				},
			},
			// Don't create the add button in the Global Settings color pickers
			addButton: this.model.get( 'global' )?.active,
			onChange: () => this.onPickerChange(),
			onClear: () => this.onPickerClear(),
			onAddButtonClick: () => this.onAddGlobalButtonClick(),
		};

		this.colorPicker = new ColorPicker( options );

		this.$pickerButton = jQuery( this.colorPicker.picker.getRoot().button );

		this.addTipsyToPickerButton();

		this.$pickerButton.on( 'click', () => this.onPickerButtonClick() );

		jQuery( this.colorPicker.picker.getRoot().root ).addClass( 'elementor-control-unit-1 elementor-control-tag-area' );

		if ( ! this.getGlobalKey() && ! this.getControlValue() ) {
			this.$el.addClass( 'e-color__no-value' );
		}
	}

	addTipsyToPickerButton() {
		this.$pickerButton.tipsy( {
			title: () => this.getCurrentValue() || '',
			offset: 4,
			gravity: () => 's',
		} );
	}

	getGlobalMeta() {
		return {
			commandName: this.getCommand(),
			key: this.model.get( 'name' ),
			title: this.colorPicker.getColorTitle(),
		};
	}

	getAddGlobalConfirmMessage( globalColors ) {
		const colorTitle = this.colorPicker.getColorTitle(),
			currentValue = this.getCurrentValue(),
			$message = jQuery( '<div>', { class: 'e-global-confirm-message' } ),
			$messageText = jQuery( '<div>' ),
			$inputWrapper = jQuery( '<div>', { class: 'e-global-confirm-input-wrapper' } ),
			$colorPreview = jQuery( '<div>', { class: 'e-global__color-preview', style: 'background-color: ' + color.value } ),
			$input = jQuery( '<input>', { type: 'text', name: 'global-name', placeholder: color.title } )
				.val( color.title );

		// Check if the color already exists in the global colors, and display an appropriate message
		Object.values( globalColors ).forEach( ( globalColor ) => {
			let messageContent;

			if ( currentValue === globalColor.value ) {
				messageContent = elementor.translate( 'global_color_already_exists' );
			} else if ( colorTitle === globalColor.title ) {
				messageContent = elementor.translate( 'global_color_name_already_exists' );
			} else {
				messageContent = elementor.translate( 'global_color_confirm_text' );
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

	// globalData is received from the Data API
	createGlobalItemMarkup( globalData ) {
		const $color = jQuery( '<div>', { class: 'e-global__preview-item e-global__color', 'data-global-id': globalData.id } ),
			$colorPreview = jQuery( '<div>', { class: 'e-global__color-preview', style: 'background-color: ' + globalData.value } ),
			$colorTitle = jQuery( '<span>', { class: 'e-global__color-title' } )
				.html( globalData.title ),
			$colorHex = jQuery( '<span>', { class: 'e-global__color-hex' } )
				.html( globalData.value );

		$color.append( $colorPreview, $colorTitle, $colorHex );

		return $color;
	}

	async getGlobalsList() {
		const result = await $e.data.get( this.getCommand() );

		return result.data;
	}

	// Create the markup for the colors in the global select dropdown
	buildGlobalsList( globalColors ) {
		const $globalColorsPreviewContainer = jQuery( '<div>', { class: 'e-global__preview-items-container' } );

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

	onPickerChange() {
		this.setValue( this.colorPicker.getColor() );

		if ( ! this.isCustom ) {
			this.triggerMethod( 'value:type:change' );

			this.colorPicker.toggleClearButtonState( true );

			if ( this.$el.hasClass( 'e-no-value-color' ) ) {
				this.$el.removeClass( 'e-no-value-color' );
			}

			this.isCustom = true;
		}
	}

	onPickerClear() {
		this.isCustom = false;

		this.setValue( '' );

		this.triggerMethod( 'value:type:change' );

		this.$el.addClass( 'e-no-value-color' );

		this.colorPicker.toggleClearButtonState( false );
	}

	onPickerButtonClick() {
		if ( this.getGlobalKey() ) {
			this.triggerMethod( 'unset:global:value' );
		}

		// If there is a value in the control, set the clear button to active, if not, deactivate it
		this.colorPicker.toggleClearButtonState( !! this.getCurrentValue() );
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
