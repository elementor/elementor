import Scrubbing from './behaviors/scrubbing';

var ControlBaseUnitsItemView = require( 'elementor-controls/base-units' ),
	ControlDimensionsItemView;

ControlDimensionsItemView = ControlBaseUnitsItemView.extend( {

	behaviors() {
		return {
			...ControlBaseUnitsItemView.prototype.behaviors.apply( this ),
			Scrubbing: {
				behaviorClass: Scrubbing,
				scrubSettings: {
					intentTime: 800,
					valueModifier: () => {
						const currentUnit = this.getControlValue( 'unit' );

						return ( [ 'rem', 'em' ].includes( currentUnit ) ) ? 0.1 : 1;
					},
					enhancedNumber: () => {
						const currentUnit = this.getControlValue( 'unit' );

						return ( [ 'rem', 'em' ].includes( currentUnit ) ) ? 0.5 : 10;
					},
				},
			},
		};
	},

	ui() {
		var ui = ControlBaseUnitsItemView.prototype.ui.apply( this, arguments );

		ui.controls = '.elementor-control-dimension > input:enabled';
		ui.link = 'button.elementor-link-dimensions';

		return ui;
	},

	events() {
		return _.extend( ControlBaseUnitsItemView.prototype.events.apply( this, arguments ), {
			'click @ui.link': 'onLinkDimensionsClicked',
		} );
	},

	// Default value must be 0, because the CSS generator (in dimensions) expects the 4 dimensions to be filled together (or all are empty).
	defaultDimensionValue: 0,

	initialize() {
		ControlBaseUnitsItemView.prototype.initialize.apply( this, arguments );

		// TODO: Need to be in helpers, and not in variable
		this.model.set( 'allowed_dimensions', this.filterDimensions( this.model.get( 'allowed_dimensions' ) ) );
	},

	getPossibleDimensions() {
		return [
			'top',
			'right',
			'bottom',
			'left',
		];
	},

	filterDimensions( filter ) {
		filter = filter || 'all';

		var dimensions = this.getPossibleDimensions();

		if ( 'all' === filter ) {
			return dimensions;
		}

		if ( ! _.isArray( filter ) ) {
			if ( 'horizontal' === filter ) {
				filter = [ 'right', 'left' ];
			} else if ( 'vertical' === filter ) {
				filter = [ 'top', 'bottom' ];
			}
		}

		return filter;
	},

	onReady() {
		var self = this,
			currentValue = self.getControlValue();

		if ( ! self.isLinkedDimensions() ) {
			self.ui.link.addClass( 'unlinked' );

			self.ui.controls.each( function( index, element ) {
				var value = currentValue[ element.dataset.setting ];

				if ( _.isEmpty( value ) ) {
					value = self.defaultDimensionValue;
				}

				self.$( element ).val( value );
			} );
		}

		self.fillEmptyDimensions();
	},

	updateDimensionsValue() {
		var currentValue = {},
			dimensions = this.getPossibleDimensions(),
			$controls = this.ui.controls,
			defaultDimensionValue = this.defaultDimensionValue;

		dimensions.forEach( function( dimension ) {
			var $element = $controls.filter( '[data-setting="' + dimension + '"]' );

			currentValue[ dimension ] = $element.length ? $element.val() : defaultDimensionValue;
		} );

		this.setValue( currentValue );
	},

	fillEmptyDimensions() {
		const $controls = this.ui.controls,
			defaultDimensionValue = this.defaultDimensionValue;

		if ( this.isLinkedDimensions() ) {
			return;
		}

		const allowedDimensions = this.model.get( 'allowed_dimensions' ),
			dimensions = this.getPossibleDimensions();
		dimensions.forEach( function( dimension ) {
			var $element = $controls.filter( '[data-setting="' + dimension + '"]' ),
				isAllowedDimension = -1 !== _.indexOf( allowedDimensions, dimension );

			if ( isAllowedDimension && $element.length && _.isEmpty( $element.val() ) ) {
				$element.val( defaultDimensionValue );
			}
		} );
	},

	updateDimensions() {
		this.fillEmptyDimensions();
		this.updateDimensionsValue();
	},

	resetDimensions() {
		this.ui.controls.val( '' );

		this.updateDimensionsValue();
	},

	onInputChange( event ) {
		var inputSetting = event.target.dataset.setting;

		if ( 'unit' === inputSetting ) {
			this.resetDimensions();
		}

		if ( ! _.contains( this.getPossibleDimensions(), inputSetting ) ) {
			return;
		}

		// When using input with type="number" and the user starts typing `-`, the actual value (`event.target.value`) is
		// an empty string. Since the user probably has the intention to insert a negative value, the methods below will
		// not be triggered. This will prevent updating the input again with an empty string.
		const hasIntentionForNegativeNumber = '-' === event?.originalEvent?.data && ! event.target.value;

		if ( hasIntentionForNegativeNumber ) {
			return;
		}

		if ( this.isLinkedDimensions() ) {
			var $thisControl = this.$( event.target );

			this.ui.controls.val( $thisControl.val() );
		}

		this.updateDimensions();
	},

	onLinkDimensionsClicked( event ) {
		event.preventDefault();
		event.stopPropagation();

		this.ui.link.toggleClass( 'unlinked' );

		this.setValue( 'isLinked', ! this.ui.link.hasClass( 'unlinked' ) );

		if ( this.isLinkedDimensions() ) {
			// Set all controls value from the first control.
			this.ui.controls.val( this.ui.controls.eq( 0 ).val() );
		}

		this.updateDimensions();
	},

	isLinkedDimensions() {
		return this.getControlValue( 'isLinked' );
	},

	updateUnitChoices() {
		ControlBaseUnitsItemView.prototype.updateUnitChoices.apply( this, arguments );

		let inputType = 'number';

		if ( this.isCustomUnit() ) {
			inputType = 'text';
		}

		this.ui.controls.attr( 'type', inputType );
	},
} );

module.exports = ControlDimensionsItemView;
