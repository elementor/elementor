import ControlBaseDataView from './base-data';
import ColorPicker from '../utils/color-picker';

export default class extends ControlBaseDataView {
	ui() {
		const ui = super.ui();

		ui.pickerContainer = '.elementor-color-picker-placeholder';

		return ui;
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

		this.addTipsyToPickerButton();

		jQuery( this.colorPicker.picker.getRoot().root ).addClass( 'elementor-control-unit-1 elementor-control-tag-area' );
	}

	addTipsyToPickerButton() {
		this.$pickerButton = jQuery( this.colorPicker.picker.getRoot().button );

		this.$pickerButton.tipsy( {
			title: () => this.getControlValue() ? this.colorPicker.getColorData().value : '',
			offset: 4,
			gravity: () => 's',
		} );
	}

	getGlobalData() {
		const colorData = this.colorPicker.getColorData();

		return {
			id: colorData.id,
			commandName: 'globals/colors',
			key: this.model.get( 'name' ),
			value: colorData.value,
		};
	}

	getAddGlobalConfirmMessage( globalColors ) {
		const color = this.colorPicker.getColorData(),
			$message = jQuery( '<div>', { class: 'e-global-confirm-message' } ),
			$messageText = jQuery( '<div>' )
				.html( elementor.translate( 'global_color_confirm_text' ) ),
			$inputWrapper = jQuery( '<div>', { class: 'e-global-confirm-input-wrapper' } ),
			$colorPreview = jQuery( '<div>', { class: 'e-global-color__preview', style: 'background-color: ' + color.value } ),
			$input = jQuery( '<input>', { type: 'text', name: 'global-name', placeholder: color.title } )
				.val( color.title );

		// Check if the color already exists in the global colors, and display an appropriate message
		Object.values( globalColors ).forEach( ( globalColor ) => {
			let messageContent = '';

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

	createGlobalItemMarkup( color ) {
		// This method is called without a color parameter when the user clicks the "Add" button
		if ( ! color ) {
			color = this.colorPicker.getColorData();
		}

		color.key = this.model.get( 'name' );

		const $color = jQuery( '<div>', { class: 'e-global-preview e-global-color', 'data-elementor-global': JSON.stringify( color ) } ),
			$colorPreview = jQuery( '<div>', { class: 'e-global-color__preview', style: 'background-color: ' + color.value } ),
			$colorTitle = jQuery( '<span>', { class: 'e-global-color__title' } )
				.html( color.name ),
			$colorHex = jQuery( '<span>', { class: 'e-global-color__hex' } )
				.html( color.value );

		$color.append( $colorPreview, $colorTitle, $colorHex );

		return $color;
	}
	// TODO: Replace placeholders with real global colors
	async getGlobalsList() {
		/*return {
			Primary: {
				id: 'primary',
				commandName: 'globals/colors',
				name: 'Primary',
				value: '#4631DA',
			},
			Secondary: {
				id: 'secondary',
				commandName: 'globals/colors',
				name: 'Secondary',
				value: '#71D7F7',
			},
			Text: {
				id: 'text',
				commandName: 'globals/colors',
				name: 'Text',
				value: '#495157',
			},
			Accent: {
				id: 'accent',
				commandName: 'globals/colors',
				name: 'Accent',
				value: '#A4AFB7',
			},
			OrangeRed: {
				id: 'orange-red',
				commandName: 'globals/colors',
				name: 'Orange Red',
				value: '#FF650E',
			},
			Crimson: {
				id: 'crimson',
				commandName: 'globals/colors',
				name: 'Crimson',
				value: '#F3113A',
			},
			GrassGreen: {
				id: 'grass-green',
				commandName: 'globals/colors',
				name: 'Grass Green',
				value: '#048647',
			},
		};*/

		const result = await $e.data.get( 'globals/colors' );

		return result.data;
	}

	buildGlobalsList( globalColors ) {
		const $globalColorsPreviewContainer = jQuery( '<div>', { class: 'e-global-previews-container' } );

		Object.values( globalColors ).forEach( ( color ) => {
			const $color = this.createGlobalItemMarkup( color );

			$globalColorsPreviewContainer.append( $color );
		} );

		this.ui.$globalColorsPreviewContainer = $globalColorsPreviewContainer;

		return $globalColorsPreviewContainer;
	}

	onPickerChange() {
		if ( this.getGlobalValue() ) {
			this.$el.find( '.e-global-selected' ).html( elementor.translate( 'custom' ) );
		}

		if ( this.$el.hasClass( 'e-invalid-color' ) ) {
			this.$el.removeClass( 'e-invalid-color' );
		}

		this.setValue( this.colorPicker.getColor() );
	}

	onPickerClear() {
		this.setValue( '' );

		this.$el.addClass( 'e-invalid-color' );

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
		this.colorPicker.destroy();
	}
}
