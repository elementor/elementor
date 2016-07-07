var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlBoxShadowItemView;

ControlBoxShadowItemView = ControlMultipleBaseItemView.extend( {
	ui: function () {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.sliders = '.elementor-control-slider';

		return ui;
	},

	childEvents: {
		'slide @ui.sliders': 'onSlideChange'
	},

	initSlider: function() {
		var sliders = this.ui.sliders,
			controlVal = this.getControlValue();

		sliders.each( function( key, value ) {
			var size = sliders.eq( key ).next( '.elementor-control-slider-input' ).children( 'input' ).val();

			sliders.eq( key ).slider( { value: size } );
		} );
	},

	onReady: function() {
		this.initSlider();
	},

	onSlideChange: function( event, ui ) {
		var $target = this.$( ui.handle ),
			$input = $target.parent().next( '.elementor-control-slider-input' ).children( 'input' ),
			type = $input.data( 'setting' );

		$input.val( ui.value );
		this.setValue( type, ui.value );

	},

	onBeforeDestroy: function() {
		this.ui.sliders.slider( 'destroy' );
		this.$el.remove();
	}
} );

module.exports = ControlBoxShadowItemView;
