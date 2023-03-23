import ControlsCSSParser from 'elementor-editor-utils/controls-css-parser';

// Add jQuery
//import $ from 'jquery';
//global.$ = $;
//global.jQuery = $;

import * as jQuery from 'jquery';
window.$ = window.jQuery = jQuery;
global.$ = global.jQuery = jQuery;

// Add jQuery
/* const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = (new JSDOM());
const globalAny = global;
const $ = globalAny.$ = require('jquery')(window);
const jQuery = globalAny.$ = require('jquery')(window); */

describe( 'ControlsCSSParser', () => {
	test( 'parseSizeUnitsSelectorsDictionary', () => {
		// Arrange.
		const cssParser = new ControlsCSSParser();

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
