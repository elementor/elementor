var ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' ),
	ControlBoxShadowItemView;

import ColorPicker from '../utils/color-picker';

ControlBoxShadowItemView = ControlMultipleBaseItemView.extend( {
	ui() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.sliders = '.elementor-slider';
		ui.colorPickerPlaceholder = '.elementor-color-picker-placeholder';

		return ui;
	},

	initSliders() {
		const value = this.getControlValue();

		this.ui.sliders.each( ( index, slider ) => {
			const $input = jQuery( slider ).next( '.elementor-slider-input' ).find( 'input' );

			const sliderInstance = noUiSlider.create( slider, {
				start: [ value[ slider.dataset.input ] ],
				step: 1,
				range: {
					min: +$input.attr( 'min' ),
					max: +$input.attr( 'max' ),
				},
				format: {
					to: ( sliderValue ) => +sliderValue.toFixed( 1 ),
					from: ( sliderValue ) => +sliderValue,
				},
			} );

			sliderInstance.on( 'slide', ( values ) => {
				const type = sliderInstance.target.dataset.input;

				$input.val( values[ 0 ] );

				this.setValue( type, values[ 0 ] );
			} );
		} );
	},

	initColors() {
		this.colorPicker = new ColorPicker( {
			picker: {
				el: this.ui.colorPickerPlaceholder[ 0 ],
				default: this.getControlValue( 'color' ),
			},
			onChange: () => {
				this.setValue( 'color', this.colorPicker.getColor() );
			},
			onClear: () => {
				this.setValue( 'color', '' );
			},
		} );
	},

	onInputChange( event ) {
		var type = event.currentTarget.dataset.setting,
			$slider = this.ui.sliders.filter( '[data-input="' + type + '"]' );

		$slider[ 0 ].noUiSlider.set( this.getControlValue( type ) );
	},

	onReady() {
		this.initSliders();
		this.initColors();
	},

	onBeforeDestroy() {
		this.colorPicker.destroy();
	},
} );

module.exports = ControlBoxShadowItemView;
