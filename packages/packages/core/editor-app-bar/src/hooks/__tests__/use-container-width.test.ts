import { createRef } from 'react';
import { act, renderHook } from '@testing-library/react';

import { useContainerWidth } from '../use-container-width';

type ResizeCallback = ( entries: Array< { contentRect: { width: number } } > ) => void;

class MockResizeObserver {
	static instances: MockResizeObserver[] = [];
	callback: ResizeCallback;

	constructor( callback: ResizeCallback ) {
		this.callback = callback;
		MockResizeObserver.instances.push( this );
	}

	observe() {}
	unobserve() {}
	disconnect() {}

	trigger( width: number ) {
		this.callback( [ { contentRect: { width } } ] );
	}
}

describe( 'useContainerWidth', () => {
	const originalResizeObserver = globalThis.ResizeObserver;

	beforeEach( () => {
		MockResizeObserver.instances = [];
		globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
	} );

	afterEach( () => {
		globalThis.ResizeObserver = originalResizeObserver;
	} );

	it( 'should return 0 before the element has been measured', () => {
		// Arrange.
		const ref = createRef< HTMLElement >();

		// Act.
		const { result } = renderHook( () => useContainerWidth( ref ) );

		// Assert.
		expect( result.current ).toBe( 0 );
	} );

	it( 'should read the initial width synchronously, before the ResizeObserver fires', () => {
		// Arrange.
		const element = document.createElement( 'div' );
		jest.spyOn( element, 'getBoundingClientRect' ).mockReturnValue( { width: 320 } as DOMRect );
		const ref = { current: element };

		// Act.
		const { result } = renderHook( () => useContainerWidth( ref ) );

		// Assert - the width is available immediately, without waiting for the observer callback.
		expect( result.current ).toBe( 320 );
	} );

	it( 'should update the width when the observed element is resized', () => {
		// Arrange.
		const element = document.createElement( 'div' );
		const ref = { current: element };

		// Act.
		const { result } = renderHook( () => useContainerWidth( ref ) );

		act( () => {
			MockResizeObserver.instances[ 0 ].trigger( 640 );
		} );

		// Assert.
		expect( result.current ).toBe( 640 );
	} );
} );
