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
	 * Get Condition Value
	 *
	 * Retrieves a passed condition's value. Dynamic values take precedence. If there is no dynamic value, this method
	 * checks for a regular control value.
	 *
	 * @since 3.7.0
	 *
	 * @param comparisonObject A settings object (e.g. element settings - keys and values)
	 * @param conditionName The conditioning control's name
	 * @param subConditionName If the conditioning control's value is an object, and the condition checks for a
	 * specific property, this is the property name.
	 * @returns {*}
	 */
	getConditionValue( comparisonObject, conditionName, subConditionName ) {
		let value;

		const dynamicValue = comparisonObject.__dynamic__?.[ conditionName ];

		if ( dynamicValue ) {
			value = dynamicValue;
		} else if ( 'object' === typeof comparisonObject[ conditionName ] && subConditionName ) {
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
				// A term consists of a control name to be examined, and a sub key if needed. For example, a term
				// can look like 'image_overlay[url]' (the 'url' is the sub key). Here we want to isolate the
				// condition name and the sub key, so later it can be retrieved and examined.
				const parsedName = term.name.match( /([\w-]+)(?:\[([\w-]+)])?/ ),
					conditionRealName = parsedName[ 1 ],
					conditionSubKey = parsedName[ 2 ],
					// We use null-safe operator since we're trying to get the current element, which is not always
					// exists, since it's only created when the specific element appears in the panel.
					placeholder = elementor.selection.getElements()[ 0 ]
						?.placeholders[ conditionRealName ];

				// If a placeholder exists for the examined control, we check against it. In any other case, we
				// use the 'comparisonObject', which includes all values of the selected widget.
				let value = placeholder || comparisonObject[ conditionRealName ];

				if ( comparisonObject?.__dynamic__[ conditionRealName ] ) {
					value = comparisonObject.__dynamic__[ conditionRealName ];
				}

				if ( 'object' === typeof value && conditionSubKey ) {
					value = value[ conditionSubKey ];
				}

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
