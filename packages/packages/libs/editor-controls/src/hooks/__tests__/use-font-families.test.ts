import { getElementorConfig, type SupportedFonts } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import { useFontFamilies } from '../use-font-families';

jest.mock( '@elementor/editor-v1-adapters' );

describe( 'useFontFamilies', () => {
	it( 'should return empty array when there are no font families', () => {
		// Arrange.
		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					options: {},
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );

	it( 'should group font families by category', () => {
		// Arrange.
		const mockFontFamilies: Record< string, SupportedFonts > = {
			Arial: 'system',
			Helvetica: 'system',
			'Custom Font 1': 'custom',
			'Custom Font 2': 'custom',
			Roboto: 'googlefonts',
			'Open Sans': 'googlefonts',
		};

		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					options: mockFontFamilies,
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 0 ] ).toEqual( {
			label: 'System',
			fonts: [ 'Arial', 'Helvetica' ],
		} );
		expect( result.current[ 1 ] ).toEqual( {
			label: 'Custom Fonts',
			fonts: [ 'Custom Font 1', 'Custom Font 2' ],
		} );
		expect( result.current[ 2 ] ).toEqual( {
			label: 'Google Fonts',
			fonts: [ 'Roboto', 'Open Sans' ],
		} );
	} );

	it( 'should group unknown font categories under Custom Fonts', () => {
		// Arrange.
		const mockFontFamilies: Record< string, SupportedFonts > = {
			Arial: 'system',
			'Custom Font': 'custom',
			Roboto: 'googlefonts',
			'Unknown Font': 'some-future-type',
		};

		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					options: mockFontFamilies,
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 0 ] ).toEqual( {
			label: 'System',
			fonts: [ 'Arial' ],
		} );
		expect( result.current[ 1 ] ).toEqual( {
			label: 'Custom Fonts',
			fonts: [ 'Custom Font', 'Unknown Font' ],
		} );
		expect( result.current[ 2 ] ).toEqual( {
			label: 'Google Fonts',
			fonts: [ 'Roboto' ],
		} );
	} );

	it( 'should group local fonts under Custom Fonts', () => {
		// Arrange.
		const mockFontFamilies: Record< string, SupportedFonts > = {
			Arial: 'system',
			'My Custom Font': 'custom',
			'My Local Font': 'local',
			Roboto: 'googlefonts',
		};

		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					options: mockFontFamilies,
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 1 ] ).toEqual( {
			label: 'Custom Fonts',
			fonts: [ 'My Custom Font', 'My Local Font' ],
		} );
	} );

	it( 'should group earlyaccess fonts under Google Fonts', () => {
		// Arrange.
		const mockFontFamilies: Record< string, SupportedFonts > = {
			Arial: 'system',
			Roboto: 'googlefonts',
			'Noto Sans Hebrew': 'earlyaccess',
		};

		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					options: mockFontFamilies,
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 2 );
		expect( result.current[ 0 ] ).toEqual( {
			label: 'System',
			fonts: [ 'Arial' ],
		} );
		expect( result.current[ 1 ] ).toEqual( {
			label: 'Google Fonts',
			fonts: [ 'Roboto', 'Noto Sans Hebrew' ],
		} );
	} );

	it( 'should handle local and earlyaccess fonts together with all other types', () => {
		// Arrange.
		const mockFontFamilies: Record< string, SupportedFonts > = {
			Arial: 'system',
			'Custom Font': 'custom',
			'Local Font': 'local',
			Roboto: 'googlefonts',
			'Alef Hebrew': 'earlyaccess',
		};

		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					options: mockFontFamilies,
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 0 ] ).toEqual( {
			label: 'System',
			fonts: [ 'Arial' ],
		} );
		expect( result.current[ 1 ] ).toEqual( {
			label: 'Custom Fonts',
			fonts: [ 'Custom Font', 'Local Font' ],
		} );
		expect( result.current[ 2 ] ).toEqual( {
			label: 'Google Fonts',
			fonts: [ 'Roboto', 'Alef Hebrew' ],
		} );
	} );

	it( 'should group variable and typekit fonts under Custom Fonts', () => {
		// Arrange.
		const mockFontFamilies: Record< string, SupportedFonts > = {
			Arial: 'system',
			'My Variable Font': 'variable',
			'My Typekit Font': 'typekit',
			Roboto: 'googlefonts',
		};

		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					options: mockFontFamilies,
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 1 ] ).toEqual( {
			label: 'Custom Fonts',
			fonts: [ 'My Variable Font', 'My Typekit Font' ],
		} );
	} );

	it( 'should return empty array when font options are not available', () => {
		// Arrange.
		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					options: undefined,
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );
} );
