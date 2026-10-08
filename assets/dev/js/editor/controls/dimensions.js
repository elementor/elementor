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
		if ( ! this.isLinkedDimensions() ) {
			this.ui.link.addClass( 'unlinked' );
		}

		// On render, keep the inputs that inherit a value from the responsive parent empty, so the
		// inherited value stays visible as a placeholder instead of being replaced by `0`.
		this.fillEmptyDimensions( { keepInherited: true } );
	},

	/**
	 * Get the value that a dimension inherits from the responsive parent control (shown as placeholder).
	 *
	 * @param {string} dimension
	 * @return {string|number|undefined} inherited value, or undefined when there is nothing to inherit
	 */
	getInheritedDimensionValue( dimension ) {
		const placeholder = this.getControlPlaceholder();

		if ( ! _.isObject( placeholder ) ) {
			return undefined;
		}

		const value = placeholder[ dimension ];

		return ( undefined === value || null === value || '' === value ) ? undefined : value;
	},

	/**
	 * Whether the control has its own dimension values (as opposed to inheriting all of them).
	 *
	 * @return {boolean} true when at least one dimension has a value of its own
	 */
	hasOwnDimensionValues() {
		const currentValue = this.getControlValue();

		return this.getPossibleDimensions().some( ( dimension ) => {
			const value = currentValue[ dimension ];

			return ! ( undefined === value || null === value || '' === value );
		} );
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

	fillEmptyDimensions( { keepInherited = false } = {} ) {
		const $controls = this.ui.controls,
			defaultDimensionValue = this.defaultDimensionValue;

		if ( this.isLinkedDimensions() ) {
			return;
		}

		const allowedDimensions = this.model.get( 'allowed_dimensions' ),
			dimensions = this.getPossibleDimensions();
		dimensions.forEach( ( dimension ) => {
			const $element = $controls.filter( '[data-setting="' + dimension + '"]' ),
				isAllowedDimension = -1 !== _.indexOf( allowedDimensions, dimension );

			if ( ! isAllowedDimension || ! $element.length || ! _.isEmpty( $element.val() ) ) {
				return;
			}

			// Prefer the value inherited from the responsive parent over the hard-coded default, so that
			// unlinking on a smaller breakpoint keeps the values of the breakpoint above instead of zeros.
			const inheritedValue = this.getInheritedDimensionValue( dimension );

			if ( undefined !== inheritedValue ) {
				if ( ! keepInherited ) {
					$element.val( inheritedValue );
				}

				return;
			}

			$element.val( defaultDimensionValue );
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

		// Toggle based on the effective state, which may be inherited from the responsive parent.
		const isLinked = ! this.isLinkedDimensions();

		this.setValue( 'isLinked', isLinked );

		if ( isLinked ) {
			// Set all controls value from the first control (or from its inherited value).
			const $firstControl = this.ui.controls.eq( 0 );

			let value = $firstControl.val();

			if ( _.isEmpty( value ) ) {
				value = this.getInheritedDimensionValue( $firstControl.data( 'setting' ) ) ?? '';
			}

			this.ui.controls.val( value );
		}

		this.updateDimensions();

		this.ui.link.toggleClass( 'unlinked', ! this.isLinkedDimensions() );
	},

	updateElementModel( value, input ) {
		const values = {
			[ input.dataset.setting ]: value,
		};

		// The base control saves the typed value before `onInputChange` runs. Once the control has a
		// value of its own, the inherited link state no longer applies, so persist it together with
		// the first value, otherwise the stored default `isLinked: true` would take over.
		if ( this.getControlValue( 'isLinked' ) && ! this.isLinkedDimensions() ) {
			values.isLinked = false;
		}

		this.setValue( values );
	},

	isLinkedDimensions() {
		const isLinked = this.getControlValue( 'isLinked' );

		// `isLinked: true` is the stored default, so a control without values of its own cannot tell
		// "untouched" from "linked on purpose". In that case, follow the responsive parent so the link
		// state matches the breakpoint whose values are inherited.
		if ( isLinked && ! this.hasOwnDimensionValues() ) {
			const parentView = this.getResponsiveParentView();

			if ( parentView && 'function' === typeof parentView.isLinkedDimensions ) {
				return parentView.isLinkedDimensions();
			}
		}

		return isLinked;
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
