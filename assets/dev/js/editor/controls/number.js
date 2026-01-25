import Scrubbing from './behaviors/scrubbing';

var ControlBaseDataView = require( 'elementor-controls/base-data' ),
	ControlNumberItemView;

ControlNumberItemView = ControlBaseDataView.extend( {

	behaviors() {
		return {
			...ControlBaseDataView.prototype.behaviors.apply( this ),
			Scrubbing: {
				behaviorClass: Scrubbing,
				scrubSettings: { intentTime: 800 },
			},
		};
	},

	registerValidators() {
		ControlBaseDataView.prototype.registerValidators.apply( this, arguments );

		var validationTerms = {},
			model = this.model;

		[ 'min', 'max' ].forEach( function( term ) {
			var termValue = model.get( term );

			if ( _.isFinite( termValue ) ) {
				validationTerms[ term ] = termValue;
			}
		} );

		if ( ! jQuery.isEmptyObject( validationTerms ) ) {
			this.addValidator( new this.validatorTypes.Number( {
				validationTerms,
			} ) );
		}
	},
}, {
	getStyleValue( placeholder, controlValue, controlData ) {
		if ( 'DEFAULT' === placeholder ) {
			return controlData.default;
		}

		if ( null === controlValue || undefined === controlValue || '' === controlValue ) {
			return controlValue;
		}

		const numValue = Number( controlValue );

		if ( ! isFinite( numValue ) || isNaN( numValue ) ) {
			return controlData.default ?? '';
		}

		return numValue;
	},
} );

module.exports = ControlNumberItemView;
