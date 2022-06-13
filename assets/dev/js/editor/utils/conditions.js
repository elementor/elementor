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

	/**
	 * Get Condition Value
	 *
	 * Retrieves a passed condition's value. Dynamic values take precedence. If there is no dynamic value, this method
	 * checks for a regular control value.
	 *
	 * @since 3.7.0
	 *
	 * @param comparisonObject The widget's settings object (setting keys and values)
	 * @param conditionName The conditioning control's name
	 * @param subConditionName If the conditioning control's value is an object, and the condition checks for a
	 * 						   specific property, this is the property name.
	 * @returns {*}
	 */
	this.getConditionValue = function( comparisonObject, conditionName, subConditionName ) {
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

				let value = self.getConditionValue( comparisonObject, conditionRealName, conditionSubKey );

				if ( ! value ) {
					let parent = controls[ conditionRealName ]?.parent;

					while ( parent ) {
						value = self.getConditionValue( comparisonObject, parent, conditionSubKey );

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
