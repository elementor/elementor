var ControlBaseUnitsItemView = require( 'elementor-controls/base-units' ),
	ControlSliderItemView;

ControlSliderItemView = ControlBaseUnitsItemView.extend( {
	ui: function() {
		var ui = ControlBaseUnitsItemView.prototype.ui.apply( this, arguments );

		ui.slider = '.elementor-slider';

		return ui;
	},

	templateHelpers: function() {
		const templateHelpers = ControlBaseUnitsItemView.prototype.templateHelpers.apply( this, arguments );

		templateHelpers.isMultiple = this.isMultiple();

		return templateHelpers;
	},

	isMultiple: function() {
		const sizes = this.getControlValue( 'sizes' );

		return ! jQuery.isEmptyObject( sizes );
	},

	initSlider: function() {
		const isMultiple = this.isMultiple(),
			unitRange = elementorCommon.helpers.cloneObject( this.getCurrentRange() ),
			step = unitRange.step;

		let sizes = this.getSize();

		if ( isMultiple ) {
			sizes = Object.values( sizes );
		} else {
			sizes = [ sizes ];

			this.ui.input.attr( unitRange );
		}

		delete unitRange.step;

		const sliderInstance = noUiSlider.create( this.ui.slider[ 0 ], {
			start: sizes,
			range: unitRange,
			step: step,
			tooltips: isMultiple,
			connect: isMultiple,
			format: {
				to: ( value ) => +value.toFixed( 1 ),
				from: ( value ) => +value,
			},
		} );

		sliderInstance.on( 'slide', this.onSlideChange.bind( this ) );
	},

	getSize: function() {
		return this.getControlValue( this.isMultiple() ? 'sizes' : 'size' );
	},

	resetSize: function() {
		if ( this.isMultiple() ) {
			this.setValue( 'sizes', {} );
		} else {
			this.setValue( 'size', '' );
		}

		this.initSlider();
	},

	onReady: function() {
		if ( this.isMultiple() ) {
			this.$el.addClass( 'elementor-control-type-slider--multiple' );
		}

		this.initSlider();
	},

	onSlideChange: function( values, index ) {
		if ( this.isMultiple() ) {
			const sizes = elementorCommon.helpers.cloneObject( this.getSize() ),
				key = Object.keys( sizes )[ index ];

			sizes[ key ] = values[ index ];

			this.setValue( 'sizes', sizes );
		} else {
			this.setValue( 'size', values[ 0 ] );

			this.ui.input.val( values[ 0 ] );
		}
	},

	onInputChange: function( event ) {
		var dataChanged = event.currentTarget.dataset.setting;

		if ( 'size' === dataChanged ) {
			this.ui.slider[ 0 ].noUiSlider.set( this.getSize() );
		} else if ( 'unit' === dataChanged ) {
			this.resetSize();
		}
	},

	onBeforeDestroy: function() {
		if ( this.ui.slider[ 0 ].noUiSlider ) {
			this.ui.slider[ 0 ].noUiSlider.destroy();
		}

		this.$el.remove();
	},
} );

module.exports = ControlSliderItemView;
