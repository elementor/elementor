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
