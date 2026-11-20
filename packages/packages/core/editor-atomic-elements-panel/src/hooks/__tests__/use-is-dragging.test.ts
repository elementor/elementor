import { act, renderHook } from '@testing-library/react';

import { useIsDragging } from '../use-is-dragging';

type Listener = () => void;

describe( 'useIsDragging', () => {
	const listeners: Record< string, Listener > = {};

	beforeEach( () => {
		( window as unknown as { elementor: unknown } ).elementor = {
			channels: {
				panelElements: {
					on: ( event: string, callback: Listener ) => {
						listeners[ event ] = callback;
					},
					off: jest.fn(),
				},
			},
		};
	} );

	it( 'should be true between drag start and drag end', () => {
		// Arrange.
		const { result } = renderHook( () => useIsDragging() );

		// Act & Assert.
		expect( result.current ).toBe( false );

		act( () => listeners[ 'element:drag:start' ]() );
		expect( result.current ).toBe( true );

		act( () => listeners[ 'element:drag:end' ]() );
		expect( result.current ).toBe( false );
	} );
} );
