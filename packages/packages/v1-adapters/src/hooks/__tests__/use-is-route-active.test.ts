import { act, renderHook } from '@testing-library/react-hooks';
import { useIsRouteActive, isRouteActive } from '@elementor/v1-adapters';

jest.mock( '../../dispatchers', () => {
	return {
		isRouteActive: jest.fn(),
	};
} );

const mockedIsRouteActive = jest.mocked( isRouteActive );

describe( '@elementor/v1-adapters/hooks/useIsRouteActive', () => {
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

	it( 'should return true when a route gets deactivated', () => {
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
