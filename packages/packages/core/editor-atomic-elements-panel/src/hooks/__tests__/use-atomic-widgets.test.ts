import { act, renderHook } from '@testing-library/react';
import { getWidgetsCache } from '@elementor/editor-elements';

import { useAtomicWidgets } from '../use-atomic-widgets';

jest.mock( '@elementor/editor-elements' );

describe( 'useAtomicWidgets', () => {
	const handlers: Record< string, () => void > = {};
	const addAction = jest.fn( ( name: string, callback: () => void ) => {
		handlers[ name ] = callback;
	} );
	const removeAction = jest.fn();

	beforeEach( () => {
		( window as unknown as { elementor: unknown } ).elementor = { hooks: { addAction, removeAction } };
	} );

	it( 'should re-read the cache when widgets are refreshed', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( { first: { title: 'First', atomic: true } } as never );
		const { result } = renderHook( () => useAtomicWidgets() );

		// Act.
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			first: { title: 'First', atomic: true },
			second: { title: 'Second', atomic: true },
		} as never );
		act( () => handlers[ 'elementor/widgets/refreshed' ]() );

		// Assert.
		expect( Object.keys( result.current ) ).toEqual( [ 'first', 'second' ] );
	} );

	it( 'should remove the listener on unmount', () => {
		// Arrange.
		jest.mocked( getWidgetsCache ).mockReturnValue( {} );
		const { unmount } = renderHook( () => useAtomicWidgets() );

		// Act.
		unmount();

		// Assert.
		expect( removeAction ).toHaveBeenCalledWith( 'elementor/widgets/refreshed', handlers[ 'elementor/widgets/refreshed' ] );
	} );
} );
