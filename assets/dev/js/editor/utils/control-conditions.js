import Conditions from './conditions';

/**
 * Control Conditions Class
 *
 * This class Handles conditions checks specifically related to element controls.
 *
 * @since 3.7.0
 */
export default class ControlConditions extends Conditions {
	/**
	 * Convert Condition to Conditions
	 *
	 * "Condition" is the simple form of Elementor's control conditioning system, which allows to create one or more
	 * conditions with an "AND" relationship between them.
	 *
	 * "Conditions" is the advanced system for conditioning controls, which allows combining AND and/or OR conditions,
	 * performing checks for larger/smaller than, checking if keys/values contain other keys/values, and more.
	 *
	 * This method receives a simple Condition (name and value) and converts it into the advanced Conditions format.
	 * format.
	 *
	 * @since 3.7.0
	 *
	 * @param {string} conditionName
	 * @param {string} conditionValue
	 * @param {{}}     controlModel   - The control being tested.
	 * @param {{}}     values         - The containing widget's array of control values.
	 * @param {{}}     controls       - The containing widget's array of control models.
	 * @return {{name, value: ({length}|*), operator: (string)}} A converted condition
	 */
	convertConditionToConditions( conditionName, conditionValue, controlModel, values, controls ) {
		// The first step is to isolate the term from the negative operator if exists. For example, a condition format
		// can look like 'selected_icon[value]!', so we examine this term with a negative connotation.
		const conditionNameParts = conditionName.match( /([\w-]+(?:\[[\w-]+])?)?(!?)$/i ),
			conditionRealName = conditionNameParts[ 1 ],
			isNegativeCondition = !! conditionNameParts[ 2 ];

		const parsedControlName = conditionRealName.match( /([\w-]+)(?:\[([\w-]+)])?/ ),
			// ConditionNameWithoutSubKey example: the condition key 'image[url]' will give the value of 'image'.
			conditionNameWithoutSubKey = parsedControlName[ 1 ],
			// ConditionSubKey example: the condition key 'image[url]' will give the value of 'url'.
			conditionSubKey = parsedControlName[ 2 ],
			// In some cases the control's attributes will be under the 'attributes' property, and in some
			// cases they will be directly on the model object.
			controlResponsiveProp = controlModel.attributes?.responsive || controlModel.responsive;

		let conditionNameToCheck = conditionRealName,
			controlValue;

		// If the conditioning control is responsive, get the appropriate device's value.
		if ( !! controlResponsiveProp && controls[ conditionNameWithoutSubKey ]?.responsive ) {
			const deviceSuffix = this.getResponsiveControlDeviceSuffix( controlResponsiveProp );

			conditionNameToCheck = conditionNameWithoutSubKey + deviceSuffix;

			if ( conditionSubKey ) {
				conditionNameToCheck += `[${ conditionSubKey }]`;
			}

			// If the control is not desktop, take the value of the conditioning control of the corresponding device.
			controlValue = values[ conditionNameWithoutSubKey + deviceSuffix ];
		} else {
			controlValue = values[ conditionRealName ];
		}

		return {
			name: conditionNameToCheck,
			operator: this.getOperator( conditionValue, isNegativeCondition, controlValue ),
			value: conditionValue,
		};
	}

	/**
	 * Get Responsive Control Device Suffix
	 *
	 * @param {Object} controlResponsiveProp
	 * @return {string|string}
	 */
	getResponsiveControlDeviceSuffix( controlResponsiveProp ) {
		const queryDevice = controlResponsiveProp.max || controlResponsiveProp.min;

		return 'desktop' === queryDevice ? '' : '_' + queryDevice;
	}

	/**
	 * Get Condition Value
	 *
	 * Retrieves a passed condition's value. Dynamic values take precedence. If there is no dynamic value, this method
	 * checks for a regular item value.
	 *
	 * @since 3.7.0
	 *
	 * @param {{}}     comparisonObject A settings object (e.g. element settings - keys and values)
	 * @param {string} conditionName    The conditioning item's name
	 * @param {string} subConditionName If the conditioning item's value is an object, and the condition checks for a
	 *                                  specific property, this is the property name.
	 * @return {*} Condition Value.
	 */
	getConditionValue( comparisonObject, conditionName, subConditionName ) {
		let value;

		const dynamicValue = comparisonObject.__dynamic__?.[ conditionName ];

		if ( dynamicValue ) {
			value = dynamicValue;
		} else {
			value = super.getConditionValue( comparisonObject, conditionName, subConditionName );
		}

		return value;
	}

	/**
	 * Check
	 *
	 * Iterates over an control's array of conditions and checks if all of them are met.
	 *
	 * @since 3.7.0
	 *
	 * @param {Array<*>} conditions       A control's array of conditions to be tested
	 * @param {{}}       comparisonObject The widget's settings object (setting keys and values)
	 * @param {{}}       controls         An object containing a widget's control models
	 * @return {boolean} id all conditions passes./
	 */
	check( conditions, comparisonObject, controls ) {
		const isOrCondition = 'or' === conditions.relation;
		let conditionSucceed = ! isOrCondition;

		conditions.terms.forEach( ( term ) => {
			let comparisonResult;

			if ( term.terms ) {
				comparisonResult = this.check( term, comparisonObject, controls );
			} else {
				// A term consists of a control name to be examined, and a sub key if needed. For example, a term
				// can look like 'image_overlay[url]' (the 'url' is the sub key). Here we want to isolate the
				// condition name and the sub key, so later it can be retrieved and examined.
				const parsedName = term.name.match( /([\w-]+)(?:\[([\w-]+)])?/ ),
					conditionRealName = parsedName[ 1 ],
					conditionSubKey = parsedName[ 2 ];

				let value = this.getConditionValue( comparisonObject, conditionRealName, conditionSubKey );

				if ( ! value ) {
					let parent = controls[ conditionRealName ]?.parent;

					while ( parent ) {
						value = this.getConditionValue( comparisonObject, parent, conditionSubKey );

						if ( value ) {
							break;
						}

						parent = controls[ parent ]?.parent;
					}
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
