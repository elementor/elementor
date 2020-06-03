module.exports = elementorModules.Module.extend( {
	errors: [],

	__construct: function( settings ) {
		var customValidationMethod = settings.customValidationMethod;

		if ( customValidationMethod ) {
			this.validationMethod = customValidationMethod;
		}
	},

	getDefaultSettings: function() {
		return {
			validationTerms: {},
		};
	},

	isValid: function() {
		var validationErrors = this.validationMethod.apply( this, arguments );

		if ( validationErrors.length ) {
			this.errors = validationErrors;

			return false;
		}

		return true;
	},

	validationMethod: function( newValue ) {
		var validationTerms = this.getSettings( 'validationTerms' ),
			errors = [];

		if ( validationTerms.required ) {
			if ( ! ( '' + newValue ).length ) {
				errors.push( 'Required value is empty' );
			}
		}

		return errors;
	},
} );
