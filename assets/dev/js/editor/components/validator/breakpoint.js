import Stylesheet from 'elementor-editor-utils/stylesheet';

const NumberValidator = require( 'elementor-validator/number' );

export default class BreakpointValidator extends NumberValidator {
	getDefaultSettings() {
		return {
			validationTerms: {
				// Max width we allow in general
				max: 5120,
			},
		};
	}

	validationMethod( newValue ) {
		const validationTerms = this.getSettings( 'validationTerms' ),
			errors = NumberValidator.prototype.validationMethod.call( this, newValue );

		if ( _.isFinite( newValue ) ) {
			if ( ! this.validateMinMaxForBreakpoint( newValue, validationTerms ) ) {
				errors.push( 'Value is not between the breakpoints above or under the edited breakpoint' );
			}
		}

		return errors;
	}

	validateMinMaxForBreakpoint( newValue, validationTerms ) {
		let isValid = true;

		if ( ! this.breakpointKeysArray ) {
			this.breakpointKeysArray = Object.keys( elementorFrontend.config.responsive.activeBreakpoints );
		}

		const breakpointIndex = this.breakpointKeysArray.indexOf( validationTerms.breakpointName ),
			topBreakpointKey = this.breakpointKeysArray[ breakpointIndex + 1 ];

		let bottomBreakpoint = Stylesheet.getDeviceMinBreakpoint( validationTerms.breakpointName );

		// Since the following comparison is <=, allow usage of the 320px value for the mobile breakpoint.
		if ( 'mobile' === validationTerms.breakpointName ) {
			bottomBreakpoint -= 1;
		}

		// If there is a breakpoint below the currently edited breakpoint, check that the value is not under the bottom
		// breakpoint's value.
		if ( bottomBreakpoint && ( newValue <= bottomBreakpoint ) ) {
			isValid = false;
		}

		// If there is a breakpoint above the currently edited breakpoint, check that the value is not above the top
		// breakpoint's value.
		if ( topBreakpointKey && newValue > elementorFrontend.config.responsive.activeBreakpoints[ topBreakpointKey ].value ) {
			isValid = false;
		}

		return isValid;
	}
}
