var ControlBaseUnitsItemView = require( 'elementor-controls/base-units' ),
	ControlSliderItemView;

ControlSliderItemView = ControlBaseUnitsItemView.extend( {
	ui: function() {
		var ui = ControlBaseUnitsItemView.prototype.ui.apply( this, arguments );

		ui.slider = '.elementor-slider';

		return ui;
	},

	events: function() {
		return _.extend( ControlBaseUnitsItemView.prototype.events.apply( this, arguments ), {
			'slide @ui.slider': 'onSlideChange'
		} );
	},

	initSlider: function() {
		var size = this.getControlValue( 'size' ),
			unitRange = this.getCurrentRange();

		this.ui.input.attr( unitRange ).val( size );

		this.ui.slider.slider( _.extend( {}, unitRange, { value: size } ) );
	},

	resetSize: function() {
		this.setValue( 'size', '' );

		this.initSlider();
	},

	onReady: function() {
		this.initSlider();
	},

	onSlideChange: function( event, ui ) {
		this.setValue( 'size', ui.value );

		this.ui.input.val( ui.value );
	},

	onInputChange: function( event ) {
		var dataChanged = event.currentTarget.dataset.setting;

		if ( 'size' === dataChanged ) {
			this.ui.slider.slider( 'value', this.getControlValue( 'size' ) );
		} else if ( 'unit' === dataChanged ) {
			this.resetSize();
		}
	},

	onBeforeDestroy: function() {
		if ( this.ui.slider.data( 'uiSlider' ) ) {
			this.ui.slider.slider( 'destroy' );
		}

		this.$el.remove();
	}
} );

module.exports = ControlSliderItemView;
