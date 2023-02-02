import init from '../init';
import { registerToggleAction } from '@elementor/top-bar';
import { renderHook } from '@testing-library/react-hooks';
import { openRoute, useIsPreviewMode, useIsRouteActive } from '@elementor/v1-adapters';
import { render } from '@testing-library/react';

jest.mock( '@elementor/top-bar', () => ( {
	registerToggleAction: jest.fn(),
} ) );

jest.mock( '@elementor/v1-adapters', () => ( {
	openRoute: jest.fn(),
	useIsPreviewMode: jest.fn(),
	useIsRouteActive: jest.fn(),
} ) );

const mockedRegisterToggleAction = jest.mocked( registerToggleAction );
const mockedIsPreviewMode = jest.mocked( useIsPreviewMode );
const mockedIsRouteActive = jest.mocked( useIsRouteActive );

describe( '@elementor/elements-panel - Init', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should register a toggle action', () => {
		// Arrange.
		init();

		const args = mockedRegisterToggleAction.mock.calls[ 0 ];
		const menuName = args[ 0 ];
		const { name, useProps } = args[ 1 ];

		if ( ! useProps ) {
			fail( 'useProps is not defined' );
		}

		const { result } = renderHook( () => useProps() );

		// Act.
		result.current.onClick?.();

		const Icon = result.current.icon;

		const { container } = render( <Icon /> );

		// Assert.
		expect( menuName ).toBe( 'tools' );
		expect( name ).toBe( 'open-elements-panel' );
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/elements/categories' );
		expect( result.current.title ).toBe( 'Add element' );
		expect( container.querySelector( 'svg' ) ).not.toBeNull();
	} );

	it.each( [
		{
			name: 'should make the toggle action active & enabled when the elements panel is open and in edit mode',
			currentRoute: 'panel/elements',
			isPreview: false,
			expected: {
				isSelected: true,
				isDisabled: false,
			},
		},
		{
			name: 'should make the toggle action inactive & disabled when the elements panel is open and in preview mode',
			currentRoute: 'panel/elements',
			isPreview: true,
			expected: {
				isSelected: false,
				isDisabled: true,
			},
		},
		{
			name: 'should make the toggle action inactive & disabled when the site-settings is open and in edit mode',
			currentRoute: 'panel/global',
			isPreview: false,
			expected: {
				isSelected: false,
				isDisabled: true,
			},
		},
		{
			name: 'should make the toggle action inactive & disabled when the site-settings is open and in preview mode',
			currentRoute: 'panel/global',
			isPreview: true,
			expected: {
				isSelected: false,
				isDisabled: true,
			},
		},
	] )( '$name', ( { isPreview, currentRoute, expected } ) => {
		// Arrange.
		init();

		const { useProps } = mockedRegisterToggleAction.mock.calls[ 0 ][ 1 ];

		if ( ! useProps ) {
			fail( 'useProps is not defined' );
		}

		mockedIsPreviewMode.mockReturnValue( isPreview );
		mockedIsRouteActive.mockImplementation( ( route ) => route === currentRoute );

		// Act.
		const { result } = renderHook( () => useProps() );

		// Assert.
		expect( result.current.selected ).toBe( expected.isSelected );
		expect( result.current.disabled ).toBe( expected.isDisabled );
	} );
} );
