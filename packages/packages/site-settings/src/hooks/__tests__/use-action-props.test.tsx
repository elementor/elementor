import useActionProps from '../use-action-props';
import { renderHook } from '@testing-library/react-hooks';
import { runCommand, useRouteStatus } from '@elementor/v1-adapters';

jest.mock( '@elementor/v1-adapters', () => ( {
	runCommand: jest.fn(),
	useRouteStatus: jest.fn(),
} ) );

describe( '@elementor/site-settings - useActionProps', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		{ title: 'open', input: { isActive: false, isBlocked: false }, expectedRoute: 'panel/global/open' },
		{ title: 'close', input: { isActive: true, isBlocked: false }, expectedRoute: 'panel/global/close' },
	] )( 'should $title the site-settings state when clicked', ( { input, expectedRoute } ) => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockImplementation( () => input );

		const { result } = renderHook( () => useActionProps() );

		// Act.
		result.current.onClick();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( expectedRoute );
	} );

	it( 'should have the correct props for disabled and selected', () => {
		// Arrange.
		jest.mocked( useRouteStatus ).mockImplementation( () => ( { isActive: true, isBlocked: true } ) );

		// Act.
		const { result } = renderHook( () => useActionProps() );

		// Assert.
		expect( result.current.selected ).toBe( true );
		expect( result.current.disabled ).toBe( true );
		expect( useRouteStatus ).toHaveBeenCalledTimes( 1 );
		expect( useRouteStatus ).toHaveBeenCalledWith( 'panel/global', { blockOnKitRoutes: false } );
	} );
} );
