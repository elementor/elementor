import { resolveIconFontGlyph, resetCustomIconFontCache } from '../custom-icon-font-svg';

describe( 'custom-icon-font-svg', () => {
	afterEach( () => {
		resetCustomIconFontCache();
		jest.restoreAllMocks();
	} );

	it( 'reads glyph paths from a fontello config.json', async () => {
		// Arrange.
		global.fetch = jest.fn().mockImplementation( ( url: string ) => {
			if ( url.endsWith( 'config.json' ) ) {
				return Promise.resolve( {
					ok: true,
					text: () =>
						Promise.resolve(
							JSON.stringify( {
								units_per_em: 1000,
								glyphs: [
									{
										css: 'emo-surprised',
										svg: { path: 'M9 9', width: 512 },
									},
								],
							} )
						),
				} );
			}

			return Promise.resolve( { ok: false, text: () => Promise.resolve( '' ) } );
		} );

		// Act.
		const glyph = await resolveIconFontGlyph(
			{ fetchJson: 'https://example.com/uploads/emo.js', prefix: 'emo-' },
			'emo-surprised',
			[ 'surprised', 'emo-surprised' ]
		);

		// Assert.
		expect( glyph?.paths ).toEqual( [ 'M9 9' ] );
		expect( glyph?.svgMarkup ).toContain( 'M9 9' );
		expect( glyph?.width ).toBe( 512 );
	} );

	it( 'reads glyph paths from an svg font referenced by css', async () => {
		// Arrange.
		global.fetch = jest.fn().mockImplementation( ( url: string ) => {
			if ( url.endsWith( 'config.json' ) || url.endsWith( 'selection.json' ) ) {
				return Promise.resolve( { ok: false, text: () => Promise.resolve( '' ) } );
			}

			if ( url.endsWith( 'emo.css' ) ) {
				return Promise.resolve( {
					ok: true,
					text: () =>
						Promise.resolve(
							`.emo-surprised:before { content: '\\e800'; } @font-face { src: url('../font/emo.svg#emo') format('svg'); }`
						),
				} );
			}

			if ( url.endsWith( 'emo.svg' ) ) {
				return Promise.resolve( {
					ok: true,
					text: () =>
						Promise.resolve(
							'<svg><font-face units-per-em="1000" ascent="850" /><glyph glyph-name="emo-surprised" unicode="&#xe800;" horiz-adv-x="1000" d="M4 4" /></svg>'
						),
				} );
			}

			return Promise.resolve( { ok: false, text: () => Promise.resolve( '' ) } );
		} );

		// Act.
		const glyph = await resolveIconFontGlyph(
			{ url: 'https://example.com/uploads/css/emo.css', prefix: 'emo-' },
			'emo-surprised',
			[ 'emo-surprised' ]
		);

		// Assert.
		expect( glyph?.paths ).toEqual( [ 'M4 4' ] );
		expect( glyph?.svgMarkup ).toContain( 'matrix(1 0 0 -1 0 850)' );
		expect( global.fetch ).toHaveBeenCalledWith(
			'https://example.com/uploads/font/emo.svg',
			expect.objectContaining( { mode: 'cors' } )
		);
	} );
} );
