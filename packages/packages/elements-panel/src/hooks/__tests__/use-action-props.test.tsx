import useActionProps from '../use-action-props';
import { renderHook } from '@testing-library/react-hooks';
import { openRoute, useIsPreviewMode, useIsRouteActive } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	openRoute: jest.fn(),
	useIsPreviewMode: jest.fn(),
	useIsRouteActive: jest.fn(),
} ) );

const mockedIsPreviewMode = jest.mocked( useIsPreviewMode );
const mockedIsRouteActive = jest.mocked( useIsRouteActive );

describe( '@elementor/elements-panel - useActionProps', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should open the elements panel on click', () => {
		// Arrange.
		const { result } = renderHook( () => useActionProps() );

		// Act.
		result.current.onClick();

		// Assert.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/elements/categories' );
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
		mockedIsPreviewMode.mockReturnValue( isPreview );
		mockedIsRouteActive.mockImplementation( ( route ) => route === currentRoute );

		// Act.
		const { result } = renderHook( () => useActionProps() );

		// Assert.
		expect( result.current.selected ).toBe( expected.isSelected );
		expect( result.current.disabled ).toBe( expected.isDisabled );
	} );
} );
