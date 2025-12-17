import { renderHook, act } from '@testing-library/react';

import { activate, deactivate, getRegistrations, isActive, register, unregister, useRegistrations } from '../registry';

describe( 'registry', () => {
	const createMockElement = () => document.createElement( 'div' );

	beforeEach( () => {
		const elementIds = [ 'test-1', 'test-2', 'test-3' ];
		elementIds.forEach( ( id ) => unregister( id ) );
	} );

	describe( 'register', () => {
		it( 'should register element', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			const registrations = getRegistrations();
			expect( registrations ).toHaveLength( 1 );
			expect( registrations[ 0 ].elementId ).toBe( 'test-1' );
			expect( registrations[ 0 ].isActive ).toBe( false );
		} );

		it( 'should register multiple elements', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );
			register( {
				elementId: 'test-2',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			expect( getRegistrations() ).toHaveLength( 2 );
		} );
	} );

	describe( 'unregister', () => {
		it( 'should unregister element', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			unregister( 'test-1' );

			expect( getRegistrations() ).toHaveLength( 0 );
		} );
	} );

	describe( 'activate', () => {
		it( 'should activate element', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			activate( 'test-1' );

			expect( isActive( 'test-1' ) ).toBe( true );
		} );

		it( 'should not activate if shouldActivate returns false', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => false,
			} );

			activate( 'test-1' );

			expect( isActive( 'test-1' ) ).toBe( false );
		} );

		it( 'should call onActivate callback', () => {
			const onActivate = jest.fn();
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
				onActivate,
			} );

			activate( 'test-1' );

			expect( onActivate ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should handle non-existent element', () => {
			expect( () => activate( 'non-existent' ) ).not.toThrow();
		} );
	} );

	describe( 'deactivate', () => {
		it( 'should deactivate element', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			activate( 'test-1' );
			deactivate( 'test-1' );

			expect( isActive( 'test-1' ) ).toBe( false );
		} );

		it( 'should handle non-existent element', () => {
			expect( () => deactivate( 'non-existent' ) ).not.toThrow();
		} );
	} );

	describe( 'isActive', () => {
		it( 'should return false for non-existent element', () => {
			expect( isActive( 'non-existent' ) ).toBe( false );
		} );

		it( 'should return correct active state', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			expect( isActive( 'test-1' ) ).toBe( false );

			activate( 'test-1' );
			expect( isActive( 'test-1' ) ).toBe( true );

			deactivate( 'test-1' );
			expect( isActive( 'test-1' ) ).toBe( false );
		} );
	} );

	describe( 'useRegistrations', () => {
		it( 'should return initial registrations', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			const { result } = renderHook( () => useRegistrations() );

			expect( result.current ).toHaveLength( 1 );
		} );

		it( 'should update when registration is added', () => {
			const { result } = renderHook( () => useRegistrations() );

			act( () => {
				register( {
					elementId: 'test-1',
					targetElement: createMockElement(),
					type: 'inline-editing',
					shouldActivate: () => true,
				} );
			} );

			expect( result.current ).toHaveLength( 1 );
		} );

		it( 'should update when element is activated', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			const { result } = renderHook( () => useRegistrations() );

			act( () => {
				activate( 'test-1' );
			} );

			expect( result.current[ 0 ].isActive ).toBe( true );
		} );

		it( 'should update when element is deactivated', () => {
			register( {
				elementId: 'test-1',
				targetElement: createMockElement(),
				type: 'inline-editing',
				shouldActivate: () => true,
			} );

			const { result } = renderHook( () => useRegistrations() );

			act( () => {
				activate( 'test-1' );
			} );

			act( () => {
				deactivate( 'test-1' );
			} );

			expect( result.current[ 0 ].isActive ).toBe( false );
		} );
	} );
} );

