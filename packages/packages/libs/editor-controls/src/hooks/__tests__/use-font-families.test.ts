import { getElementorConfig } from '@elementor/editor-v1-adapters';
import { renderHook } from '@testing-library/react';

import { useFontFamilies } from '../use-font-families';

jest.mock( '@elementor/editor-v1-adapters' );

const mockFontConfig = ( groups: Record< string, string >, options: Record< string, string > ) => {
	jest.mocked( getElementorConfig ).mockReturnValue( {
		controls: {
			font: { groups, options },
		},
	} );
};

describe( 'useFontFamilies', () => {
	it( 'should return empty array when there are no font families', () => {
		// Arrange.
		mockFontConfig(
			{ system: 'System', googlefonts: 'Google' },
			{},
		);

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );

	it( 'should group font families by their config groups', () => {
		// Arrange.
		mockFontConfig(
			{
				system: 'System',
				custom: 'Custom Fonts',
				googlefonts: 'Google',
			},
			{
				Arial: 'system',
				Helvetica: 'system',
				'Custom Font 1': 'custom',
				'Custom Font 2': 'custom',
				Roboto: 'googlefonts',
				'Open Sans': 'googlefonts',
			},
		);

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
			label: 'Google',
			fonts: [ 'Roboto', 'Open Sans' ],
		} );
	} );

	it( 'should skip fonts whose category is not in groups', () => {
		// Arrange.
		mockFontConfig(
			{ system: 'System', googlefonts: 'Google' },
			{
				Arial: 'system',
				Roboto: 'googlefonts',
				'Unknown Font': 'not-registered',
			},
		);

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 2 );
		expect( result.current[ 0 ] ).toEqual( {
			label: 'System',
			fonts: [ 'Arial' ],
		} );
		expect( result.current[ 1 ] ).toEqual( {
			label: 'Google',
			fonts: [ 'Roboto' ],
		} );
	} );

	it( 'should preserve group order from config', () => {
		// Arrange.
		mockFontConfig(
			{
				custom: 'Custom Fonts',
				system: 'System',
				googlefonts: 'Google',
			},
			{
				Arial: 'system',
				'My Font': 'custom',
				Roboto: 'googlefonts',
			},
		);

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 0 ].label ).toBe( 'Custom Fonts' );
		expect( result.current[ 1 ].label ).toBe( 'System' );
		expect( result.current[ 2 ].label ).toBe( 'Google' );
	} );

	it( 'should render Pro font groups with their own labels', () => {
		// Arrange.
		mockFontConfig(
			{
				custom: 'Custom Fonts',
				typekit: 'Adobe Fonts',
				variable: 'Variable Fonts',
				system: 'System',
				googlefonts: 'Google',
				earlyaccess: 'Google (Early Access)',
			},
			{
				Arial: 'system',
				'My Custom Font': 'custom',
				'My Typekit Font': 'typekit',
				'My Variable Font': 'variable',
				Roboto: 'googlefonts',
				'Noto Sans Hebrew': 'earlyaccess',
			},
		);

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 6 );
		expect( result.current[ 0 ] ).toEqual( {
			label: 'Custom Fonts',
			fonts: [ 'My Custom Font' ],
		} );
		expect( result.current[ 1 ] ).toEqual( {
			label: 'Adobe Fonts',
			fonts: [ 'My Typekit Font' ],
		} );
		expect( result.current[ 2 ] ).toEqual( {
			label: 'Variable Fonts',
			fonts: [ 'My Variable Font' ],
		} );
		expect( result.current[ 3 ] ).toEqual( {
			label: 'System',
			fonts: [ 'Arial' ],
		} );
		expect( result.current[ 4 ] ).toEqual( {
			label: 'Google',
			fonts: [ 'Roboto' ],
		} );
		expect( result.current[ 5 ] ).toEqual( {
			label: 'Google (Early Access)',
			fonts: [ 'Noto Sans Hebrew' ],
		} );
	} );

	it( 'should skip empty groups', () => {
		// Arrange.
		mockFontConfig(
			{
				system: 'System',
				custom: 'Custom Fonts',
				googlefonts: 'Google',
			},
			{
				Arial: 'system',
				Roboto: 'googlefonts',
			},
		);

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toHaveLength( 2 );
		expect( result.current[ 0 ].label ).toBe( 'System' );
		expect( result.current[ 1 ].label ).toBe( 'Google' );
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

	it( 'should return empty array when font groups are not available', () => {
		// Arrange.
		jest.mocked( getElementorConfig ).mockReturnValue( {
			controls: {
				font: {
					groups: undefined,
					options: { Arial: 'system' },
				},
			},
		} );

		// Act.
		const { result } = renderHook( () => useFontFamilies() );

		// Assert.
		expect( result.current ).toEqual( [] );
	} );
} );
