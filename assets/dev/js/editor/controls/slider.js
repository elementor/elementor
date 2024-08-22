var ControlBaseUnitsItemView = require( 'elementor-controls/base-units' ),
	ControlSliderItemView;

import { convertSizeToFrString } from 'elementor-editor-utils/helpers';

ControlSliderItemView = ControlBaseUnitsItemView.extend( {
	ui() {
		var ui = ControlBaseUnitsItemView.prototype.ui.apply( this, arguments );

		ui.slider = '.elementor-slider';

		return ui;
	},

	templateHelpers() {
		const templateHelpers = ControlBaseUnitsItemView.prototype.templateHelpers.apply( this, arguments );

		templateHelpers.isMultiple = this.isMultiple();

		return templateHelpers;
	},

	isMultiple() {
		const sizes = this.getControlValue( 'sizes' );

		return ! jQuery.isEmptyObject( sizes );
	},

	initSlider() {
		// Slider does not exist in tests.
		if ( ! this.ui.slider[ 0 ] ) {
			return;
		}

		if ( this.isCustomUnit() ) {
			return;
		}

		this.destroySlider();

		const isMultiple = this.isMultiple(),
			unitRange = elementorCommon.helpers.cloneObject( this.getCurrentRange() ),
			step = unitRange.step;

		let sizes = this.getSize();

		if ( isMultiple ) {
			sizes = Object.values( sizes );
		} else {
			sizes = [ sizes ];

			// Make sure the value is a number, because the slider can't handle strings.
			sizes[ 0 ] = parseFloat( sizes[ 0 ] ) || 0;

			this.ui.input.attr( unitRange );
		}

		delete unitRange.step;

		let tooltips;

		const self = this;

		if ( isMultiple ) {
			tooltips = [];

			sizes.forEach( () => tooltips.push( {
				to: ( value ) => value + self.getControlValue( 'unit' ),
			} ) );
		}

		const sliderInstance = noUiSlider.create( this.ui.slider[ 0 ], {
			start: sizes,
			range: unitRange,
			step,
			tooltips,
			connect: isMultiple,
			format: {
				to: ( value ) => Math.round( value * 1000 ) / 1000,
				from: ( value ) => +value,
			},
		} );

		sliderInstance.on( 'slide', this.onSlideChange.bind( this ) );
	},

	applySavedValue() {
		ControlBaseUnitsItemView.prototype.applySavedValue.apply( this, arguments );
		// Slider does not exist in tests.
		if ( this.isSliderInitialized() ) {
			this.ui.slider[ 0 ].noUiSlider.set( this.getSize() );
		}
	},

	isSliderInitialized() {
		return ( this.ui.slider[ 0 ] && this.ui.slider[ 0 ].noUiSlider );
	},

	getSize() {
		const property = this.isMultiple() ? 'sizes' : 'size',
			value = this.getControlValue( property );

		return value ||
			this.getControlPlaceholder()?.[ property ] ||
			this.model.get( 'default' )?.[ property ];
	},

	resetSize() {
		if ( this.isMultiple() ) {
			this.setValue( 'sizes', {} );
		} else {
			this.setValue( 'size', '' );
		}

		this.initSlider();
	},

	destroySlider() {
		// Slider does not exist in tests.
		if ( this.ui.slider[ 0 ] && this.ui.slider[ 0 ].noUiSlider ) {
			this.ui.slider[ 0 ].noUiSlider.destroy();
		}
	},

	onReady() {
		if ( this.isMultiple() ) {
			this.$el.addClass( 'elementor-control-type-slider--multiple elementor-control-type-slider--handles-' + this.model.get( 'handles' ) );
		}

		this.initSlider();
	},

	onSlideChange( values, index ) {
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

	onInputChange( event ) {
		var dataChanged = event.currentTarget.dataset.setting;

		if ( 'size' === dataChanged && this.isSliderInitialized() ) {
			this.ui.slider[ 0 ].noUiSlider.set( this.getSize() );
		} else if ( 'unit' === dataChanged ) {
			this.handleUnitChange();
		}
	},

	handleUnitChange() {
		if ( ! this.isCustomUnit() ) {
			this.resetSize();
		}

		this.maybeDoFractionToCustomConversions();
	},

	updateUnitChoices() {
		ControlBaseUnitsItemView.prototype.updateUnitChoices.apply( this, arguments );

		let inputType = 'number';

		if ( this.isCustomUnit() ) {
			inputType = 'text';
			this.destroySlider();
		} else {
			this.initSlider();
		}

		if ( ! this.isMultiple() ) {
			this.ui.input.attr( 'type', inputType );
		}
	},

	maybeDoFractionToCustomConversions() {
		if ( this.isMultiple() ) {
			return;
		}

		/*
		We want our code to run only when the user switched from 'fr' to 'custom'.
		But currently we do not have the previous state, so we won't know the user was previously on 'fr'.
		So we make the assumption that if the control only has two units ('fr' and 'custom'), and we
		are switching to custom now, then we can run our conversion logic.
		In future, we might want to investigate a way to build some kind of 'previous state cache' to know
		where we switched from.
		*/
		const sizeUnits = this.model.get( 'size_units' ),
			isFrToCustom = 2 === sizeUnits?.length && sizeUnits.includes( 'fr' ) && sizeUnits.includes( 'custom' );

		if ( ! isFrToCustom ) {
			return;
		}

		const currentSize = this.getSize(),
			alreadyConverted = 'string' === typeof currentSize && currentSize.includes( 'fr' );

		if ( alreadyConverted ) {
			return;
		}

		const sizeValue = this.isCustomUnit()
			? convertSizeToFrString( currentSize )
			: this.getControlPlaceholder()?.size || this.model.get( 'default' )?.size;

		this.setValue( 'size', sizeValue );
		this.render();
	},

	onBeforeDestroy() {
		this.destroySlider();

		this.$el.remove();
	},

	onDeviceModeChange() {
		const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
			isMobile = 'mobile' === currentDeviceMode,
			isMobileValue = this.model.get( 'name' ).includes( '_mobile' ),
			hasDefault = this.model.get( 'default' ),
			shouldRunConversion = isMobile && isMobileValue && hasDefault && this.isCustomUnit();

		if ( shouldRunConversion ) {
			setTimeout( () => {
				this.maybeDoFractionToCustomConversions();
			} );
		}
	},
} );

module.exports = ControlSliderItemView;
