var Validator = require( 'elementor-validator/base' );

module.exports = Validator.extend( {
	validationMethod( newValue ) {
		var validationTerms = this.getSettings( 'validationTerms' ),
			errors = [];

		if ( _.isFinite( newValue ) ) {
			if ( undefined !== validationTerms.min && newValue < validationTerms.min ) {
				errors.push( 'Value is less than minimum' );
			}

			if ( undefined !== validationTerms.max && newValue > validationTerms.max ) {
				errors.push( 'Value is greater than maximum' );
			}
		}

		return errors;
	},
} );
