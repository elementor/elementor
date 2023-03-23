import ControlsCSSParserHelper from 'elementor-editor-utils/controls-css-parser-helper';

describe( 'Controls CSS Parser Helper', () => {
	test( 'Fraction unit', () => {
		// Arrange.
		const cssParser = new ControlsCSSParserHelper();

		// Act.
		let values = {
			unit: 'fr',
			size: 2,
			sizes: [],
		};

		let string = '--e-con-grid-template-columns: repeat({{SIZE}}, 1fr)';
		string = cssParser.parseSizeUnitsSelectorsDictionary( string, values );

		const comparisonResult = '--e-con-grid-template-columns: repeat(2, 1fr)' === string;

		// Assert.
		expect( comparisonResult ).toBe( true );
	} );

	test( 'Custom unit', () => {
		// Arrange.
		const cssParser = new ControlsCSSParserHelper();

		// Act.
		let values = {
			unit: 'custom',
			size: '3fr 200px 1fr',
			sizes: [],
		};

		let string = '--e-con-grid-template-columns: {{SIZE}}';
		string = cssParser.parseSizeUnitsSelectorsDictionary( string, values );

		const comparisonResult = '--e-con-grid-template-columns: 3fr 200px 1fr' === stringTwo;

		// Assert.
		expect( comparisonResult ).toBe( true );
	} );
} );
