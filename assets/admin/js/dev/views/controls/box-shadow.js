var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlBoxShadowItemView;

ControlBoxShadowItemView = ControlMultipleBaseItemView.extend( {
	ui: function () {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.sliders = '.elementor-control-slider';
		ui.colors = '.color-picker-hex';

		return ui;
	},

	childEvents: {
		'slide @ui.sliders': 'onSlideChange'
	},

	initSliders: function() {
		var value = this.getControlValue();

		this.ui.sliders.each( function() {
			Backbone.$( this ).slider( { value: value[ this.dataset.input ] } );
		} );
	},

	initColors: function() {
		var $colors = this.ui.colors,
			self = this;

		$colors.each( function(){
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

	onInputChange: function ( event ) {
		var type = event.currentTarget.dataset.setting,
			$slider = this.ui.sliders.filter( '[data-input="' + type + '"]' );

		$slider.slider( { value: this.getControlValue( type ) } );
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
	}
} );

module.exports = ControlBoxShadowItemView;
