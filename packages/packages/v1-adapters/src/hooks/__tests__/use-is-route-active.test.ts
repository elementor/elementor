import { useIsRouteActive } from '../';
import { act, renderHook } from '@testing-library/react-hooks';

describe( '@elementor/v1-adapters/hooks/useIsActiveRoute', () => {
	let isActiveByDefault: boolean;

	beforeEach( () => {
		( window as any ).$e = {
			routes: {
				is: jest.fn( () => isActiveByDefault ),
			},
		};
	} );

	afterEach( () => {
		delete ( window as any ).$e.routes.is;
	} );

	it( 'should return false when a route is inactive by default', () => {
		// Arrange.
		const route = 'panel/menu';

		isActiveByDefault = false;

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should return true when a route is active by default', () => {
		// Arrange.
		const route = 'panel/menu';

		isActiveByDefault = true;

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		// Assert.
		expect( result.current ).toBe( true );
	} );

	it( 'should return true when a route gets activated', () => {
		// Arrange.
		const route = 'panel/menu';

		isActiveByDefault = false;

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		act( () => {
			dispatchRouteOpen( route );
		} );

		// Assert.
		expect( result.current ).toBe( true );
	} );

	it( 'should return true when a route gets deactivated', () => {
		// Arrange.
		const route = 'panel/menu';

		isActiveByDefault = true;

		// Act.
		const { result } = renderHook( () => useIsRouteActive( route ) );

		act( () => {
			dispatchRouteClose( route );
		} );

		// Assert.
		expect( result.current ).toBe( false );
	} );
} );

// TODO: Move to some test-utils file.
function dispatchRouteOpen( route: string ) {
	window.dispatchEvent( new CustomEvent( 'elementor/routes/open', {
		detail: {
			route,
		},
	} ) );
}

function dispatchRouteClose( route: string ) {
	window.dispatchEvent( new CustomEvent( 'elementor/routes/close', {
		detail: {
			route,
		},
	} ) );
}
