import Conditions from 'elementor-editor-utils/conditions';

describe( 'Conditions', () => {
	test( 'Compare', () => {
		// Arrange.
		const conditions = new Conditions();

		// Act
		const leftValue = 10,
			rightValue = 20,
			operator = '<';

		const comparisonResult = conditions.compare( leftValue, rightValue, operator );

		// Assert.
		expect( comparisonResult ).toBe( true );
	} );

	test( 'Get Operator', () => {
		// Arrange.
		const conditions = new Conditions();

		// Act - Test regular positive condition value.
		const operator = conditions.getOperator( 'testConditionValue', false, 'testControlValue' );

		// Assert.
		expect( operator ).toBe( undefined );

		// Act - Test regular negative condition value.
		const negativeConditionOperator = conditions.getOperator( 'testConditionValue', true, 'testControlValue' );

		// Assert.
		expect( negativeConditionOperator ).toBe( '!==' );

		// Arrange
		const testArrayCondition = {
			'testConditionName!': [ 'subConditionValue' ],
		};

		// Act - Test array negative condition value.
		const arrayNegativeConditionValueOperator = conditions.getOperator( testArrayCondition[ 'testConditionName!' ], true, 'testControlValue' );

		// Assert.
		expect( arrayNegativeConditionValueOperator ).toBe( '!in' );

		// Arrange
		const testArrayControlValue = {
			testControlName: [ 'testControlValueArrayItem' ],
		};

		// Act - Test array control value.
		const arrayControlValueOperator = conditions.getOperator( 'testConditionValue', false, testArrayControlValue.testControlName );

		// Assert.
		expect( arrayControlValueOperator ).toBe( 'contains' );
	} );

	test( 'Get Condition Value', () => {
		// Arrange.
		const conditions = new Conditions();

		const values = {
			testControl: 'testControlValue',
			testCondition: 'testConditionValue',
			testConditionObject: {
				testSubCondition: 'testSubConditionValue',
			},
		};

		// Act - Test regular condition value.
		const conditionValue = conditions.getConditionValue( values, 'testCondition' );

		// Assert.
		expect( conditionValue ).toBe( 'testConditionValue' );

		// Act - Test sub-condition value.
		const subConditionValue = conditions.getConditionValue( values, 'testConditionObject', 'testSubCondition' );

		// Assert.
		expect( subConditionValue ).toBe( 'testSubConditionValue' );
	} );

	test( 'Check', () => {
		// Arrange.
		const conditions = new Conditions();

		const comparisonObject = {
			testCondition: 'testConditionValue',
		};

		const testConditions = {
			terms: [ {
				name: 'testCondition',
				operator: undefined,
				value: 'testConditionValue',
			} ],
		};

		// Act
		const result = conditions.check( testConditions, comparisonObject );

		// Assert.
		expect( result ).toBe( true );

		// Arrange - Fail on purpose
		const testConditionsFail = {
			terms: [ {
				name: 'testCondition',
				operator: '!==',
				value: 'testConditionValue',
			} ],
		};

		// Act
		const failResult = conditions.check( testConditionsFail, comparisonObject );

		// Assert.
		expect( failResult ).toBe( false );
	} );
} );
