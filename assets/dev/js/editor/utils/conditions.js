export default class Conditions {
	compare( leftValue, rightValue, operator ) {
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
	}

	/**
	 * Get Operator
	 *
	 * Returns the condition's comparison operator according to the structure of the condition and item values.
	 *
	 * @since 3.7.0
	 *
	 * @param {*}       conditionValue
	 * @param {boolean} isNegativeCondition
	 * @param {8}       currentValue
	 * @return {string} The operator to use.
	 */
	getOperator( conditionValue, isNegativeCondition, currentValue ) {
		let operator;

		if ( Array.isArray( conditionValue ) && conditionValue.length ) {
			operator = isNegativeCondition ? '!in' : 'in';
		} else if ( Array.isArray( currentValue ) && currentValue.length ) {
			operator = isNegativeCondition ? '!contains' : 'contains';
		} else if ( isNegativeCondition ) {
			operator = '!==';
		}

		return operator;
	}

	/**
	 * Get Condition Value
	 *
	 * Retrieves a passed condition's value.
	 *
	 * @since 3.7.0
	 *
	 * @param {{}}     comparisonObject A settings object (e.g. element settings - keys and values)
	 * @param {string} conditionName    The conditioning item's name
	 * @param {string} subConditionName If the conditioning item's value is an object, and the condition checks for a
	 *                                  specific property, this is the property name.
	 * @return {*} Condition Value
	 */
	getConditionValue( comparisonObject, conditionName, subConditionName ) {
		let value;

		if ( 'object' === typeof comparisonObject[ conditionName ] && subConditionName ) {
			value = comparisonObject[ conditionName ][ subConditionName ];
		} else {
			value = comparisonObject[ conditionName ];
		}

		return value;
	}

	check( conditions, comparisonObject ) {
		const isOrCondition = 'or' === conditions.relation;
		let conditionSucceed = ! isOrCondition;

		conditions.terms.forEach( ( term ) => {
			let comparisonResult;

			if ( term.terms ) {
				comparisonResult = this.check( term, comparisonObject );
			} else {
				// A term consists of a condition name (id) to be examined, and a sub key if the condition source is
				// an object. For example, a term can look like 'image_overlay[url]' (the 'url' is the sub key). Here
				// we want to isolate the condition name and the sub key, so later it can be retrieved and examined.
				const parsedName = term.name.match( /([\w-]+)(?:\[([\w-]+)])?/ ),
					conditionRealName = parsedName[ 1 ],
					conditionSubKey = parsedName[ 2 ];

				const value = this.getConditionValue( comparisonObject, conditionRealName, conditionSubKey );

				comparisonResult = ( undefined !== value ) &&
					this.compare( value, term.value, term.operator );
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
	}
}
