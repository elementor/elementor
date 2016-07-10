var ControlMultipleBaseItemView = require( 'elementor-views/controls/base-multiple' ),
	ControlBoxShadowItemView;

ControlBoxShadowItemView = ControlMultipleBaseItemView.extend( {
	ui: function () {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.inset = '.elementor-control-box-shadow-inset';
		ui.sliders = '.elementor-control-slider';
		ui.colors = '.color-picker-hex';

		return ui;
	},

	childEvents: {
		'slide @ui.sliders': 'onSlideChange',
		'change @ui.inset': 'onInsetChange'
	},

	onInsetChange: function( event ) {
		var value = 'no' !== event.target.value ? ' ' + event.target.value : '';

		this.setValue( 'inset', value );
	},

	initSliders: function() {
		var sliders = this.ui.sliders;

		sliders.each( function( key, value ) {
			var size = sliders.eq( key ).next( '.elementor-control-slider-input' ).children( 'input' ).val();

			sliders.eq( key ).slider( { value: size } );
		} );
	},

	initColors: function() {
		var colors = this.ui.colors;
			model = this;

		colors.each( function( key, value ){
			var color = colors.eq( key );

			color.wpColorPicker( {
				change: _.bind( function() {
					var type = color.data( 'setting' );

					model.setValue( type, color.wpColorPicker( 'color' ) );
				}, model ),

				clear: _.bind( function() {
					var type = color.data( 'setting' );

					model.setValue( type, '' );
				}, model ),

				width: 251
			} );
		}, model );
	},

	onReady: function() {
		var value = '' !== this.getControlValue( 'inset' ) ? 'inset' : 'no';

		this.ui.inset.val( value );

		this.initSliders();
		this.initColors();
	},

	onSlideChange: function( event, ui ) {
		var $target = this.$( ui.handle ),
			$input = $target.parent().next( '.elementor-control-slider-input' ).children( 'input' ),
			type = $input.data( 'setting' );

		$input.val( ui.value );
		this.setValue( type, ui.value );
	},

	onBeforeDestroy: function() {
		this.$el.remove();
	}
} );

module.exports = ControlBoxShadowItemView;
