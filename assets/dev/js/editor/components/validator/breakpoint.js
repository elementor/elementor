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

	/**
	 * Get Panel Active Breakpoints
	 *
	 * Since the active kit used in the Site Settings panel could be a draft, we need to use the panel's active
	 * breakpoints settings and not the elementorFrontend.config values (which come from the DB).
	 *
	 * @return {*} Object
	 */
	getPanelActiveBreakpoints() {
		const panelBreakpoints = elementor.documents.currentDocument.config.settings.settings.active_breakpoints.map( ( breakpointName ) => {
			return breakpointName.replace( 'viewport_', '' );
		} ),
			panelActiveBreakpoints = {};

		panelBreakpoints.forEach( ( breakpointName ) => {
			panelActiveBreakpoints[ breakpointName ] = elementorFrontend.config.responsive.breakpoints[ breakpointName ];
		} );

		return panelActiveBreakpoints;
	}

	initBreakpointProperties() {
		const validationTerms = this.getSettings( 'validationTerms' ),
			activeBreakpoints = this.getPanelActiveBreakpoints(),
			breakpointKeys = Object.keys( activeBreakpoints );

		this.breakpointIndex = breakpointKeys.indexOf( validationTerms.breakpointName );
		this.topBreakpoint = activeBreakpoints[ breakpointKeys[ this.breakpointIndex + 1 ] ]?.value;
		this.bottomBreakpoint = activeBreakpoints[ breakpointKeys[ this.breakpointIndex - 1 ] ]?.value;
	}

	validationMethod( newValue ) {
		const validationTerms = this.getSettings( 'validationTerms' ),
			errors = NumberValidator.prototype.validationMethod.call( this, newValue );

		// Validate both numeric and empty values, since breakpoints utilize default values when empty.
		if ( _.isFinite( newValue ) || '' === newValue ) {
			if ( ! this.validateMinMaxForBreakpoint( newValue, validationTerms ) ) {
				errors.push( 'Value is not between the breakpoints above or under the edited breakpoint' );
			}
		}

		return errors;
	}

	validateMinMaxForBreakpoint( newValue, validationTerms ) {
		const breakpointDefaultValue = elementorFrontend.config.responsive.breakpoints[ validationTerms.breakpointName ].default_value;

		let isValid = true;

		this.initBreakpointProperties();

		// Since the following comparison is <=, allow usage of the 320px value for the mobile breakpoint.
		if ( 'mobile' === validationTerms.breakpointName && 320 === this.bottomBreakpoint ) {
			this.bottomBreakpoint -= 1;
		}

		// If there is a breakpoint below the currently edited breakpoint
		if ( this.bottomBreakpoint ) {
			// Check that the new value is not under the bottom breakpoint's value.
			if ( '' !== newValue && newValue <= this.bottomBreakpoint ) {
				isValid = false;
			}

			// If the new value is empty, check that the default breakpoint value is not below the bottom breakpoint.
			if ( '' === newValue && breakpointDefaultValue <= this.bottomBreakpoint ) {
				isValid = false;
			}
		}

		// If there is a breakpoint above the currently edited breakpoint.
		if ( this.topBreakpoint ) {
			// Check that the value is not above the top breakpoint's value.
			if ( '' !== newValue && newValue >= this.topBreakpoint ) {
				isValid = false;
			}

			// If the new value is empty, check that the default breakpoint value is not above the top breakpoint.
			if ( '' === newValue && breakpointDefaultValue >= this.topBreakpoint ) {
				isValid = false;
			}
		}

		return isValid;
	}
}
