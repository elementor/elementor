import ControlsCSSParserHelper from 'elementor-editor-utils/controls-css-parser-helper';

describe( 'ControlsCSSParserHelper', () => {
	test( 'parseSizeUnitsSelectorsDictionary', () => {
		// Arrange.
		const cssParser = new ControlsCSSParserHelper();

		// Act.
		let values = {
			unit: 'fr',
			size: 2,
			sizes: [],
		};

		let string = '--e-con-grid-template-columns: {{SIZE}}';
		string = cssParser.parseSizeUnitsSelectorsDictionary( string, values );

		let stringTwo = '--e-con-grid-template-columns: {{SIZE}}{{UNIT}}';
		stringTwo = cssParser.parseSizeUnitsSelectorsDictionary( stringTwo, values );

		const firstComparisonResult = '--e-con-grid-template-columns: 2' === string;
		const secondComparisonResult = '--e-con-grid-template-columns: 2fr' === stringTwo;

		// Assert.
		expect( firstComparisonResult ).toBe( true );
		expect( secondComparisonResult ).toBe( true );
	} );
} );
