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
		const behaviors = super.behaviors();

		behaviors.globalControlSelect = {
			behaviorClass: GlobalControlSelect,
			popoverContent: this.getGlobalColors(),
			popoverTitle: elementor.translate( 'global_colors_title' ),
			manageButtonText: elementor.translate( 'manage_global_colors' ),
			tooltipText: elementor.translate( 'global_colors_info' ),
		};

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

	createGlobalColorPreviewMarkup( color ) {
		const $color = jQuery( '<div>', { class: 'elementor-global-preview elementor-global-color', 'data-elementor-global-name': color.name } ),
			$colorPreview = jQuery( '<div>', { class: 'elementor-global-color__preview', style: 'background-color:' + color.code } ),
			$colorTitle = jQuery( '<span>', { class: 'elementor-global-color__title' } )
				.html( color.name ),
			$colorHex = jQuery( '<span>', { class: 'elementor-global-color__hex' } )
				.html( color.code );

		$color.append( $colorPreview, $colorTitle, $colorHex );

		return $color;
	}

	// TODO: Replace placeholders with real global colors
	getPlaceholderColorsList() {
		return {
			Primary: {
				name: 'Primary',
				code: '#4631DA',
			},
			Secondary: {
				name: 'Secondary',
				code: '#71D7F7',
			},
			Text: {
				name: 'Text',
				code: '#495157',
			},
			Accent: {
				name: 'Accent',
				code: '#A4AFB7',
			},
			OrangeRed: {
				name: 'Orange Red',
				code: '#FF650E',
			},
			Crimson: {
				name: 'Crimson',
				code: '#F3113A',
			},
			GrassGreen: {
				name: 'Grass Green',
				code: '#048647',
			},
		};
	}

	getGlobalColors() {
		const $globalColorsRepeaterContainer = jQuery( '<div>', { class: 'elementor-global-colors-repeater-container' } ),
			globalColors = this.getPlaceholderColorsList();

		globalColors.values( globalColors ).forEach( ( color ) => {
			const $color = this.createGlobalColorPreviewMarkup( color );

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
