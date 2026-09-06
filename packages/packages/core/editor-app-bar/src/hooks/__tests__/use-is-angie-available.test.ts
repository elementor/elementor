import { act, renderHook } from '@testing-library/react';

const mockIsAngieAvailable = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	isAngieAvailable: () => mockIsAngieAvailable(),
} ) );

import { useIsAngieAvailable } from '../use-is-angie-available';

type ObserverCallback = MutationCallback;

class MockMutationObserver {
	static instances: MockMutationObserver[] = [];
	callback: ObserverCallback;
	disconnect = jest.fn();

	constructor( callback: ObserverCallback ) {
		this.callback = callback;
		MockMutationObserver.instances.push( this );
	}

	observe() {}

	trigger() {
		this.callback( [], this as unknown as MutationObserver );
	}
}

describe( 'useIsAngieAvailable', () => {
	const originalMutationObserver = globalThis.MutationObserver;

	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		MockMutationObserver.instances = [];
		globalThis.MutationObserver = MockMutationObserver as unknown as typeof MutationObserver;
	} );

	afterEach( () => {
		globalThis.MutationObserver = originalMutationObserver;
	} );

	it( 'should return true when Angie is already available', () => {
		// Arrange.
		mockIsAngieAvailable.mockReturnValue( true );

		// Act.
		const { result } = renderHook( () => useIsAngieAvailable() );

		// Assert.
		expect( result.current ).toBe( true );
	} );

	it( 'should return false when Angie is not available yet', () => {
		// Arrange.
		mockIsAngieAvailable.mockReturnValue( false );

		// Act.
		const { result } = renderHook( () => useIsAngieAvailable() );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	it( 'should update when Angie becomes available after mount', () => {
		// Arrange.
		mockIsAngieAvailable.mockReturnValue( false );

		const { result } = renderHook( () => useIsAngieAvailable() );

		expect( result.current ).toBe( false );

		// Act.
		mockIsAngieAvailable.mockReturnValue( true );

		act( () => {
			MockMutationObserver.instances[ 0 ]?.trigger();
		} );

		// Assert.
		expect( result.current ).toBe( true );
		expect( MockMutationObserver.instances[ 0 ]?.disconnect ).toHaveBeenCalled();
	} );
} );
