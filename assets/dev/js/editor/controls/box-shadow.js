var ControlMultipleBaseItemView = require( 'elementor-controls/base-multiple' ),
	ControlBoxShadowItemView;

ControlBoxShadowItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.sliders = '.elementor-slider';
		ui.colors = '.elementor-shadow-color-picker';

		return ui;
	},

	initSliders: function() {
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

	initColors: function() {
		var self = this;

		elementor.helpers.wpColorPicker( this.ui.colors, {
			change: function() {
				var $this = jQuery( this ),
					type = $this.data( 'setting' );

				self.setValue( type, $this.wpColorPicker( 'color' ) );
			},

			clear: function() {
				self.setValue( this.dataset.setting, '' );
			},
		} );
	},

	onInputChange: function( event ) {
		var type = event.currentTarget.dataset.setting,
			$slider = this.ui.sliders.filter( '[data-input="' + type + '"]' );

		$slider[ 0 ].noUiSlider.set( this.getControlValue( type ) );
	},

	onReady: function() {
		this.initSliders();
		this.initColors();
	},

	onBeforeDestroy: function() {
		this.ui.colors.each( function() {
			var $color = jQuery( this );

			if ( $color.wpColorPicker( 'instance' ) ) {
				$color.wpColorPicker( 'close' );
			}
		} );

		this.$el.remove();
	},
} );

module.exports = ControlBoxShadowItemView;
