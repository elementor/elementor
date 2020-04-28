import ControlBaseDataView from './base-data';
import ColorPicker from '../utils/color-picker';
import GlobalControlSelect from './behaviors/global-select-behavior';

export default class extends ControlBaseDataView {
	ui() {
		const ui = super.ui();

		ui.pickerContainer = '.elementor-color-picker-placeholder';

		return ui;
	}

	behaviors() {
		return [
			{
				behaviorClass: GlobalControlSelect,
				popoverContent: this.getGlobalColors(),
			},
		];
	}

	applySavedValue() {
		if ( this.colorPicker ) {
			this.colorPicker.picker.setColor( this.getControlValue() );
		} else {
			this.initPicker();
		}
	}

	initPicker() {
		const options = {
			picker: {
				el: this.ui.pickerContainer[ 0 ],
				default: this.getControlValue(),
				components: {
					opacity: this.model.get( 'alpha' ),
				},
			},
			onChange: () => this.onPickerChange(),
			onClear: () => this.onPickerClear(),
		};

		this.colorPicker = new ColorPicker( options );

		jQuery( this.colorPicker.picker.getRoot().root ).addClass( 'elementor-control-unit-1 elementor-control-tag-area' );
	}

	// TODO: Replace placeholders with real global colors
	getGlobalColors() {
		const $globalColorsRepeaterContainer = jQuery( '<div>', { class: 'elementor-global-colors-repeater-container' } ),
			globalColors = [
			[ 'Primary', '#4631DA' ],
			[ 'Secondary', '#71D7F7' ],
			[ 'Text', '#495157' ],
			[ 'Accent', '#A4AFB7' ],
			[ 'Orange Red', '#FF650E' ],
			[ 'Crimson', '#F3113A' ],
			[ 'Grass Green', '#048647' ],
		];

		globalColors.forEach( ( color ) => {
			const $color = jQuery( '<div>', { class: 'elementor-global-preview elementor-global-color', 'data-elementor-global-name': color[ 0 ] } ),
				$colorPreview = jQuery( '<div>', { class: 'elementor-global-color__preview', style: 'background-color:' + color[ 1 ] } ),
				$colorTitle = jQuery( '<span>', { class: 'elementor-global-color__title' } )
					.html( color[ 0 ] ),
				$colorHex = jQuery( '<span>', { class: 'elementor-global-color__hex' } )
					.html( color[ 1 ] );

			$color.append( $colorPreview, $colorTitle, $colorHex );

			$globalColorsRepeaterContainer.append( $color );
		} );

		return $globalColorsRepeaterContainer;
	}

	onPickerChange() {
		this.setValue( this.colorPicker.getColor() );
	}

	onPickerClear() {
		this.setValue( '' );
	}

	onBeforeDestroy() {
		this.colorPicker.destroy();
	}
}
