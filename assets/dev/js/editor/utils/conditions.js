var Conditions;

Conditions = function() {
	var self = this;

	this.compare = function( leftValue, rightValue, operator ) {
		switch ( operator ) {
			/* jshint ignore:start */
			case '==':
				return leftValue == rightValue;
			case '!=':
				return leftValue != rightValue;
			/* jshint ignore:end */
			case '!==':
				return leftValue !== rightValue;
			case 'in':
				return -1 !== rightValue.indexOf( leftValue );
			case '!in':
				return -1 === rightValue.indexOf( leftValue );
			case '<':
				return leftValue < rightValue;
			case '<=':
				return leftValue <= rightValue;
			case '>':
				return leftValue > rightValue;
			case '>=':
				return leftValue >= rightValue;
			default:
				return leftValue === rightValue;
		}
	};

	this.checkTerms = function( terms, comparisonObject, relation ) {
		var isOrCondition = 'or' === relation,
			conditionSucceed = ! isOrCondition;

		Backbone.$.each( terms, function() {
			var term = this,
				value = comparisonObject[ term.name ],
				comparisonResult = self.compare( value, term.value, term.operator );

			if ( isOrCondition ) {
				if ( comparisonResult ) {
					conditionSucceed = true;
				}

				return ! comparisonResult;
			}

			if ( ! comparisonResult ) {
				return conditionSucceed = false;
			}
		} );

		return conditionSucceed;
	};

	this.check = function( conditions, comparisonObject ) {
		var relation = conditions.relation,
			checkTermsResult = self.checkTerms( conditions.terms, comparisonObject, relation ),
			nestedConditionResult;

		if ( conditions.nested ) {
			nestedConditionResult = self.check( conditions.nested, comparisonObject );
		}

		if ( 'or' === relation ) {
			return checkTermsResult || nestedConditionResult;
		}

		return checkTermsResult && ( nestedConditionResult || ! conditions.nested );
	};
};

module.exports = new Conditions();
