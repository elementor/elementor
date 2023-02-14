import useActionProps from '../use-action-props';
import { renderHook } from '@testing-library/react-hooks';
import { runCommand, useIsPreviewMode, useIsRouteActive } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
	useIsPreviewMode: jest.fn(),
	useIsRouteActive: jest.fn(),
} ) );

const mockedIsPreviewMode = jest.mocked( useIsPreviewMode );
const mockedIsRouteActive = jest.mocked( useIsRouteActive );

describe( '@elementor/structure - useActionProps', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should toggle the navigator state when clicked', () => {
		// Arrange.
		const { result } = renderHook( () => useActionProps() );

		// Act.
		result.current.onClick();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'navigator/toggle' );
	} );

	it.each( [
		{
			name: 'should make the toggle action active & enabled when the navigator is open and in edit mode',
			currentRoute: 'navigator',
			isPreview: false,
			expected: {
				isSelected: true,
				isDisabled: false,
			},
		},
		{
			name: 'should make the toggle action active & enabled when the navigator is not open and in edit mode',
			currentRoute: 'panel/elements',
			isPreview: false,
			expected: {
				isSelected: false,
				isDisabled: false,
			},
		},
		{
			name: 'should make the toggle action inactive & disabled when the navigator is open and in preview mode',
			currentRoute: 'navigator',
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
