import { renderHook } from '@testing-library/react';

import { getElementorConfig } from '../../../../../sync/get-elementor-globals';
import { type SupportedFonts } from '../../../../../sync/types';
import { useFontFamilies } from '../use-font-families';

jest.mock( '../../../../../sync/get-elementor-globals' );

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

	it( 'should filter out unsupported font categories', () => {
		// Arrange.
		const mockFontFamilies: Record< string, SupportedFonts > = {
			Arial: 'system',
			'Custom Font': 'custom',
			Roboto: 'googlefonts',
			'Unsupported Font': 'not-supported', // This will be filtered out by the component's logic
		} as unknown as Record< string, SupportedFonts >;

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
			fonts: [ 'Custom Font' ],
		} );
		expect( result.current[ 2 ] ).toEqual( {
			label: 'Google Fonts',
			fonts: [ 'Roboto' ],
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
