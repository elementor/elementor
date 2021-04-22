const NumberValidator = require( 'elementor-validator/number' );

module.exports = NumberValidator.extend( {
	breakpointKeysArray: [],

	getDefaultSettings: function() {
		return {
			validationTerms: {
				// Min width we allow for mobile
				min: 320,
				// Max width we allow in general
				max: 5120,
			},
		};
	},

	validationMethod: function( newValue ) {
		const validationTerms = this.getSettings( 'validationTerms' ),
			errors = NumberValidator.prototype.validationMethod.call( this, newValue );

		if ( _.isFinite( newValue ) ) {
			if ( ! this.validateMinMaxForBreakpoint( newValue, validationTerms ) ) {
				errors.push( 'Value is not between the breakpoints above or under the edited breakpoint' );
			}
		}

		return errors;
	},

	validateMinMaxForBreakpoint: function( newValue, validationTerms ) {
		let isValid = true;

		if ( ! this.breakpointKeysArray.length ) {
			this.breakpointKeysArray = Object.keys( elementorFrontend.config.responsive.activeBreakpoints );
		}

		const breakpointIndex = this.breakpointKeysArray.indexOf( validationTerms.breakpointName ),
			bottomBreakpointKey = this.breakpointKeysArray[ breakpointIndex - 1 ],
			topBreakpointKey = this.breakpointKeysArray[ breakpointIndex + 1 ];

		// If there is a breakpoint below the currently edited breakpoint, check that the value is not under the bottom
		// breakpoint's value.
		if ( bottomBreakpointKey && newValue <= elementorFrontend.config.responsive.activeBreakpoints[ bottomBreakpointKey ].value ) {
			isValid = false;
		}

		// If there is a breakpoint above the currently edited breakpoint, check that the value is not above the top
		// breakpoint's value.
		if ( topBreakpointKey && newValue >= elementorFrontend.config.responsive.activeBreakpoints[ topBreakpointKey ].value ) {
			isValid = false;
		}

		return isValid;
	},
} );
