import { act, renderHook } from '@testing-library/react-hooks';
import useIsRouteActive from '../use-is-route-active';
import { dispatchRouteClose, dispatchRouteOpen } from '../../__tests__/utils';
import { mockIsRouteActive } from './test-utils';

describe( '@elementor/v1-adapters - useIsRouteActive', () => {
	it( 'should return false when a route is inactive by default', () => {
		// Arrange.
		const route = 'panel/menu';

		mockIsRouteActive( () => false );

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should return true when a route is active by default', () => {
		// Arrange.
		const route = 'panel/menu';

		mockIsRouteActive( () => true );

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		// Assert.
		expect( result.current ).toBe( true );
	} );

	it( 'should return true when a route gets activated', () => {
		// Arrange.
		const route = 'panel/menu';

		mockIsRouteActive( () => false );

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		act( () => {
			mockIsRouteActive( () => true );
			dispatchRouteOpen( route );
		} );

		// Assert.
		expect( result.current ).toBe( true );
	} );

	it( 'should return false when a route gets deactivated', () => {
		// Arrange.
		const route = 'panel/menu';

		mockIsRouteActive( () => true );

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		act( () => {
			mockIsRouteActive( () => false );
			dispatchRouteClose( route );
		} );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should re-check whether the route is active when changing it', () => {
		// Arrange.
		mockIsRouteActive( ( r ) => {
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
