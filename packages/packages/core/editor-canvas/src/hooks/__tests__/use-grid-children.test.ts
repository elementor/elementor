/* eslint-disable testing-library/no-node-access */
import { act, renderHook } from '@testing-library/react';

import { useGridChildren } from '../use-grid-children';

type ResizeCallback = ( entries: unknown[] ) => void;

class MockResizeObserver {
	static instances: MockResizeObserver[] = [];
	callback: ResizeCallback;
	observed: Element[] = [];
	disconnected = false;

	constructor( callback: ResizeCallback ) {
		this.callback = callback;
		MockResizeObserver.instances.push( this );
	}

	observe( element: Element ) {
		this.observed.push( element );
	}

	unobserve( element: Element ) {
		this.observed = this.observed.filter( ( item ) => item !== element );
	}

	disconnect() {
		this.disconnected = true;
		this.observed = [];
	}

	trigger() {
		this.callback( [] );
	}
}

function createGridWithChildren( count: number ): HTMLElement {
	const grid = document.createElement( 'div' );
	for ( let i = 0; i < count; i++ ) {
		grid.appendChild( document.createElement( 'div' ) );
	}
	document.body.appendChild( grid );
	return grid;
}

describe( 'useGridChildren', () => {
	const originalResizeObserver = globalThis.ResizeObserver;

	beforeEach( () => {
		MockResizeObserver.instances = [];
		globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
	} );

	afterEach( () => {
		globalThis.ResizeObserver = originalResizeObserver;
		document.body.innerHTML = '';
	} );

	it( 'returns 0 for a null element', () => {
		const { result } = renderHook( () => useGridChildren( null ) );

		expect( result.current ).toBe( 0 );
		expect( MockResizeObserver.instances ).toHaveLength( 0 );
	} );

	it( 'observes existing children on mount', () => {
		const grid = createGridWithChildren( 2 );

		renderHook( () => useGridChildren( grid ) );

		expect( MockResizeObserver.instances ).toHaveLength( 1 );
		expect( MockResizeObserver.instances[ 0 ].observed ).toHaveLength( 2 );
	} );

	it( 'increments when a child is appended', async () => {
		const grid = createGridWithChildren( 1 );

		const { result } = renderHook( () => useGridChildren( grid ) );
		const before = result.current;

		await act( async () => {
			grid.appendChild( document.createElement( 'div' ) );
			await Promise.resolve();
		} );

		expect( result.current ).toBeGreaterThan( before );
		expect( MockResizeObserver.instances[ 0 ].observed ).toHaveLength( 2 );
	} );

	it( 'increments when a child is removed', async () => {
		const grid = createGridWithChildren( 2 );

		const { result } = renderHook( () => useGridChildren( grid ) );
		const before = result.current;

		await act( async () => {
			grid.removeChild( grid.children[ 0 ] );
			await Promise.resolve();
		} );

		expect( result.current ).toBeGreaterThan( before );
		expect( MockResizeObserver.instances[ 0 ].observed ).toHaveLength( 1 );
	} );

	it( 'increments when children are reordered', async () => {
		const grid = createGridWithChildren( 3 );

		const { result } = renderHook( () => useGridChildren( grid ) );
		const before = result.current;

		await act( async () => {
			grid.insertBefore( grid.children[ 2 ], grid.children[ 0 ] );
			await Promise.resolve();
		} );

		expect( result.current ).toBeGreaterThan( before );
	} );

	it( 'increments when a child resizes', () => {
		const grid = createGridWithChildren( 1 );

		const { result } = renderHook( () => useGridChildren( grid ) );
		const before = result.current;

		act( () => {
			MockResizeObserver.instances[ 0 ].trigger();
		} );

		expect( result.current ).toBeGreaterThan( before );
	} );

	it( 'disconnects observers on unmount', () => {
		const grid = createGridWithChildren( 2 );

		const { unmount } = renderHook( () => useGridChildren( grid ) );

		unmount();

		expect( MockResizeObserver.instances[ 0 ].disconnected ).toBe( true );
	} );

	it( 'switches observation when the element changes', () => {
		const first = createGridWithChildren( 1 );
		const second = createGridWithChildren( 2 );

		const { rerender } = renderHook( ( { element } ) => useGridChildren( element ), {
			initialProps: { element: first as HTMLElement | null },
		} );

		const initialObserver = MockResizeObserver.instances[ 0 ];

		rerender( { element: second } );

		expect( initialObserver.disconnected ).toBe( true );
		expect( MockResizeObserver.instances ).toHaveLength( 2 );
		expect( MockResizeObserver.instances[ 1 ].observed ).toHaveLength( 2 );
	} );
} );
