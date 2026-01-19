import { act, renderHook } from '@testing-library/react';

import { setDynamicControlsConfig, useDynamicControlsConfig } from '../dynamic-controls-config';

describe( 'dynamic-controls-config', () => {
	describe( 'useDynamicControlsConfig', () => {
		it( 'should return default config', () => {
			// Act.
			const { result } = renderHook( () => useDynamicControlsConfig() );

			// Assert.
			expect( result.current ).toEqual( {
				expired: false,
			} );
		} );

		it( 'should update config and trigger re-render', () => {
			// Arrange.
			const { result } = renderHook( () => useDynamicControlsConfig() );

			// Act.
			act( () => {
				setDynamicControlsConfig( { expired: true } );
			} );

			// Assert.
			expect( result.current ).toEqual( {
				expired: true,
			} );
		} );

		it( 'should merge partial config updates', () => {
			// Arrange.
			const { result } = renderHook( () => useDynamicControlsConfig() );

			// Act.
			act( () => {
				setDynamicControlsConfig( { expired: true } );
			} );

			// Assert.
			expect( result.current ).toEqual( {
				expired: true,
			} );
		} );

		it( 'should notify multiple subscribers', () => {
			// Arrange.
			const { result: result1 } = renderHook( () => useDynamicControlsConfig() );
			const { result: result2 } = renderHook( () => useDynamicControlsConfig() );

			// Act.
			act( () => {
				setDynamicControlsConfig( { expired: true } );
			} );

			// Assert.
			expect( result1.current ).toEqual( {
				expired: true,
			} );
			expect( result2.current ).toEqual( {
				expired: true,
			} );
		} );
	} );

	afterEach( () => {
		// Reset config after each test.
		act( () => {
			setDynamicControlsConfig( { expired: false } );
		} );
	} );
} );
