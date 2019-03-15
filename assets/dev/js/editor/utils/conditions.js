var Conditions;

Conditions = function() {
	var self = this;

	this.compare = function( leftValue, rightValue, operator ) {
		switch ( operator ) {
			/* eslint-disable eqeqeq */
			case '==':
				return leftValue == rightValue;
			case '!=':
				return leftValue != rightValue;
			/* eslint-enable eqeqeq */
			case '!==':
				return leftValue !== rightValue;
			case 'in':
				return -1 !== rightValue.indexOf( leftValue );
			case '!in':
				return -1 === rightValue.indexOf( leftValue );
			case 'contains':
				return -1 !== leftValue.indexOf( rightValue );
			case '!contains':
				return -1 === leftValue.indexOf( rightValue );
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

	this.check = function( conditions, comparisonObject ) {
		var isOrCondition = 'or' === conditions.relation,
			conditionSucceed = ! isOrCondition;

		jQuery.each( conditions.terms, function() {
			var term = this,
				comparisonResult;

			if ( term.terms ) {
				comparisonResult = self.check( term, comparisonObject );
			} else {
				var parsedName = term.name.match( /(\w+)(?:\[(\w+)])?/ ),
					value = null;

				if ( typeof( comparisonObject[ parsedName[ 1 ] ] ) !== 'undefined' ) {
					value = comparisonObject[ parsedName[ 1 ] ];
				}

				if ( parsedName[ 2 ] ) {
					if ( typeof( value[ parsedName[ 2 ] ] ) !== 'undefined' ) {
            value = value[ parsedName[ 2 ] ];
          } else {
						value = null;
					}
				}

				comparisonResult = self.compare( value, term.value, term.operator );
			}

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
};

module.exports = new Conditions();
