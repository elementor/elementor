import useActionProps from '../use-action-props';
import { renderHook } from '@testing-library/react-hooks';
import { runCommand, useIsRouteActive } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
	useIsRouteActive: jest.fn(),
} ) );

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
			name: 'should make the toggle action active when the navigator is open',
			currentRoute: 'navigator',
			expected: {
				isSelected: true,
			},
		},
		{
			name: 'should make the toggle action inactive when the navigator is closed',
			currentRoute: 'elements/panel',
			expected: {
				isSelected: false,
			},
		},
	] )( '$name', ( { currentRoute, expected } ) => {
		// Arrange.
		mockedIsRouteActive.mockImplementation( ( route ) => route === currentRoute );

		// Act.
		const { result } = renderHook( () => useActionProps() );

		// Assert.
		expect( result.current.selected ).toBe( expected.isSelected );
	} );
} );
