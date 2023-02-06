import { act, renderHook } from '@testing-library/react-hooks';
import { useIsRouteActive, isRouteActive } from '../../';
import { dispatchRouteClose, dispatchRouteOpen } from '../../__tests__/utils';

jest.mock( '../../utils', () => {
	return {
		isRouteActive: jest.fn(),
	};
} );

const mockedIsRouteActive = jest.mocked( isRouteActive );

describe( '@elementor/v1-adapters - useIsRouteActive', () => {
	it( 'should return false when a route is inactive by default', () => {
		// Arrange.
		const route = 'panel/menu';

		mockedIsRouteActive.mockReturnValue( false );

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should return true when a route is active by default', () => {
		// Arrange.
		const route = 'panel/menu';

		mockedIsRouteActive.mockReturnValue( true );

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		// Assert.
		expect( result.current ).toBe( true );
	} );

	it( 'should return true when a route gets activated', () => {
		// Arrange.
		const route = 'panel/menu';

		mockedIsRouteActive.mockReturnValue( false );

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		act( () => {
			mockedIsRouteActive.mockReturnValue( true );
			dispatchRouteOpen( route );
		} );

		// Assert.
		expect( result.current ).toBe( true );
	} );

	it( 'should return false when a route gets deactivated', () => {
		// Arrange.
		const route = 'panel/menu';

		mockedIsRouteActive.mockReturnValue( true );

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		act( () => {
			mockedIsRouteActive.mockReturnValue( false );
			dispatchRouteClose( route );
		} );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should re-check whether the route is active when changing it', () => {
		// Arrange.
		mockedIsRouteActive.mockImplementation( ( r ) => {
			return 'active/route' === r;
		} );

		// Act.
		const { result, rerender } = renderHook( ( { route } ) => useIsRouteActive( route ), {
			initialProps: {
				route: 'active/route',
			},
		} );

		// Assert.
		expect( result.current ).toBe( true );

		// Act.
		rerender( {
			route: 'inactive/route',
		} );

		// Assert.
		expect( result.current ).toBe( false );
	} );
} );
