import ControlConditions from 'elementor-editor-utils/control-conditions';

describe( 'Control Conditions', () => {
	test( 'Convert Condition To Conditions', () => {
		// Arrange.
		const conditions = new ControlConditions();

		// Act
		const leftValue = 10,
			rightValue = 20,
			operator = '<';

		const comparisonResult = conditions.compare( leftValue, rightValue, operator );

		// Assert.
		expect( comparisonResult ).toBe( true );
	} );

	test( 'Get Condition Value', () => {
		// Arrange.
		const conditions = new ControlConditions();

		const values = {
			testControl: 'testControlValue',
			testCondition: 'testConditionValue',
			testConditionObject: {
				testSubCondition: 'testSubConditionValue',
			},
			testConditionDynamic: 'testConditionNonDynamicValue',
			__dynamic__: {
				testConditionDynamic: 'testConditionDynamicValue',
			},
		};

		// Act - Test Dynamic sub-condition value.
		const dynamicConditionValue = conditions.getConditionValue( values, 'testConditionDynamic' );

		// Assert.
		expect( dynamicConditionValue ).toBe( 'testConditionDynamicValue' );
	} );

	test( 'Check', () => {
		// Arrange.
		const conditions = new ControlConditions();

		const comparisonObject = {
			testCondition: 'testConditionValue',
		};

		const testControlModels = {
			testControl: {
				parent: null,
			},
			testCondition: {
				parent: null,
			},
		};

		const testConditions = {
			terms: [ {
				name: 'testCondition',
				operator: undefined,
				value: 'testConditionValue',
			} ],
		};

		// Act
		const result = conditions.check( testConditions, comparisonObject, testControlModels );

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
		const failResult = conditions.check( testConditionsFail, comparisonObject, testControlModels );

		// Assert.
		expect( failResult ).toBe( false );
	} );
} );
