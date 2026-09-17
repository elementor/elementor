import { collectHardcodedFonts } from '../collect-hardcoded-fonts';

describe( 'collectHardcodedFonts', () => {
	it( 'collects a top-level font_family setting with path', () => {
		const settings = { typography_font_family: 'Roboto' };

		expect( collectHardcodedFonts( settings ) ).toEqual( [ { path: 'typography_font_family', value: 'Roboto' } ] );
	} );

	it( 'collects nested repeater font settings', () => {
		const settings = {
			tabs: [
				{ tab_title: 'One', title_typography_font_family: 'Roboto', _id: 'a' },
				{ tab_title: 'Two', title_typography_font_family: 'Arial', _id: 'b' },
			],
		};

		expect( collectHardcodedFonts( settings ) ).toEqual( [
			{ path: 'tabs[0].title_typography_font_family', value: 'Roboto' },
			{ path: 'tabs[1].title_typography_font_family', value: 'Arial' },
		] );
	} );

	it( 'skips settings linked via __globals__', () => {
		const settings = {
			typography_font_family: 'Roboto',
			__globals__: { typography_font_family: 'globals/typography?id=primary' },
		};

		expect( collectHardcodedFonts( settings ) ).toEqual( [] );
	} );

	it( 'skips globals/ font references', () => {
		const settings = { typography_font_family: 'globals/typography?id=primary' };

		expect( collectHardcodedFonts( settings ) ).toEqual( [] );
	} );

	it( 'ignores non-font settings', () => {
		const settings = { background_color: '#ff0000', typography: 'custom' };

		expect( collectHardcodedFonts( settings ) ).toEqual( [] );
	} );
} );
