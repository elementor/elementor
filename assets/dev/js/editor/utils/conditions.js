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

	this.check = function( conditions, comparisonObject, controls ) {
		const isOrCondition = 'or' === conditions.relation;
		let conditionSucceed = ! isOrCondition;

		jQuery.each( conditions.terms, function() {
			const term = this;
			let comparisonResult;

			if ( term.terms ) {
				comparisonResult = self.check( term, comparisonObject, controls );
			} else {
				// A term consists of a control name to be examined, and a sub key if needed. For example, a term
				// can look like 'image_overlay[url]' (the 'url' is the sub key). Here we want to isolate the
				// condition name and the sub key, so later it can be retrieved and examined.
				const parsedName = term.name.match( /([\w-]+)(?:\[([\w-]+)])?/ ),
					conditionRealName = parsedName[ 1 ],
					conditionSubKey = parsedName[ 2 ];

				let dynamicValue = comparisonObject.__dynamic__?.[ conditionRealName ],
					value;

				if ( dynamicValue ) {
					value = dynamicValue;
				} else {
					value = comparisonObject[ conditionRealName ];

					if ( 'object' === typeof value && conditionSubKey ) {
						value = value[ conditionSubKey ];
					}
				}

				if ( ! value ) {
					// 1. Go to parent
					// 2. Check for dynamic value first, because dynamic takes precedence.
					// 3. If there is no dynamic value, check for a regular control value.
					// 4. If there is no regular value, Go back to step 1.
					let parent = controls[ conditionRealName ]?.parent;

					while ( parent ) {
						dynamicValue = comparisonObject.__dynamic__?.[ parent ];

						if ( dynamicValue ) {
							value = dynamicValue;

							break;
						}

						if ( 'object' === typeof comparisonObject[ parent ] && conditionSubKey ) {
							value = comparisonObject[ parent ][ conditionSubKey ];
						} else {
							value = comparisonObject[ parent ];
						}

						if ( value ) {
							break;
						}

						parent = controls[ parent ]?.parent;
					}
				}

				comparisonResult = ( undefined !== value ) &&
					self.compare( value, term.value, term.operator );
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
