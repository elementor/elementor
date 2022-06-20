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
				name: 'testControl',
				label: 'Test Control',
				description: '',
				show_label: true,
				label_block: false,
				separator: 'default',
				toggle: true,
				type: 'text',
				tab: 'content',
				section: 'section_title',
				default: '',
				parent: null,
			},
			testCondition: {
				name: 'testControl',
				label: 'Test Control',
				description: '',
				show_label: true,
				label_block: false,
				separator: 'default',
				toggle: true,
				type: 'text',
				tab: 'content',
				section: 'section_title',
				default: '',
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
