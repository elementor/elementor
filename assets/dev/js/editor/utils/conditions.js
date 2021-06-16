var Conditions;

Conditions = function() {
	const self = this;

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
		const isOrCondition = 'or' === conditions.relation;
		let conditionSucceed = ! isOrCondition;

		jQuery.each( conditions.terms, function() {
			const term = this;
			let comparisonResult;

			if ( term.terms ) {
				comparisonResult = self.check( term, comparisonObject );
			} else {
				const parsedName = term.name.match( /(\w+)(?:\[(\w+)])?/ ),
					conditionRealName = parsedName[ 1 ],
					conditionSubKey = parsedName[ 2 ],
					placeholder = elementor.getPanelView().getCurrentPageView()
						?.getControlModel?.( conditionRealName )?.get( 'placeholder' );
				let value = placeholder || comparisonObject[ conditionRealName ];

				if ( comparisonObject.__dynamic__ && comparisonObject.__dynamic__[ conditionRealName ] ) {
					value = comparisonObject.__dynamic__[ conditionRealName ];
				}

				if ( value && conditionSubKey ) {
					value = value[ conditionSubKey ];
				}

				comparisonResult = undefined !== value ?
					self.compare( value, term.value, term.operator ) :
					true;
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
