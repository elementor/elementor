var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlBoxShadowItemView;

ControlBoxShadowItemView = ControlMultipleBaseItemView.extend( {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.sliders = '.elementor-control-slider';
		ui.colors = '.elementor-box-shadow-color-picker';

		return ui;
	},

	childEvents: {
		'slide @ui.sliders': 'onSlideChange'
	},

	initSliders: function() {
		var value = this.getControlValue();

		this.ui.sliders.each( function() {
			var $slider = Backbone.$( this ),
				$input = $slider.next( '.elementor-control-slider-input' ).find( 'input' ),
				min = Number( $input.attr( 'min' ) ),
				max = Number( $input.attr( 'max' ) );

			$slider.slider( {
				value: value[ this.dataset.input ],
				min: min,
				max: max
			} );
		} );
	},

	initColors: function() {
		var $colors = this.ui.colors,
			self = this;

		$colors.each( function() {
			var $color = Backbone.$( this );

			$color.wpColorPicker( {
				change: function() {
					var type = $color.data( 'setting' );

					self.setValue( type, $color.wpColorPicker( 'color' ) );
				},

				clear: function() {
					var type = $color.data( 'setting' );

					self.setValue( type, '' );
				},

				width: 251
			} );
		} );
	},

	onInputChange: function( event ) {
		var type = event.currentTarget.dataset.setting,
			$slider = this.ui.sliders.filter( '[data-input="' + type + '"]' ),
			$input = Backbone.$( event.currentTarget ),
			min = Number( $input.attr( 'min' ) ),
			max = Number( $input.attr( 'max' ) );

		$slider.slider( {
			value: this.getControlValue( type ),
			min: min,
			max: max
		} );
	},

	onReady: function() {
		this.initSliders();
		this.initColors();
	},

	onSlideChange: function( event, ui ) {
		var type = event.currentTarget.dataset.input,
			$input = this.ui.input.filter( '[data-setting="' + type + '"]' );

		$input.val( ui.value );
		this.setValue( type, ui.value );
	},

	onBeforeDestroy: function() {
		this.ui.colors.each( function() {
			var $color = Backbone.$( this );

			if ( $color.wpColorPicker( 'instance' ) ) {
				$color.wpColorPicker( 'close' );
			}
		} );

		this.$el.remove();
	}
} );

module.exports = ControlBoxShadowItemView;
