import { act, renderHook } from '@testing-library/react';

import { setLicenseConfig, useLicenseConfig } from '../use-license-config';

describe( 'use-license-config', () => {
	describe( 'useLicenseConfig', () => {
		it( 'should return default config', () => {
			// Act.
			const { result } = renderHook( () => useLicenseConfig() );

			// Assert.
			expect( result.current ).toEqual( {
				expired: false,
			} );
		} );

		it( 'should update config and trigger re-render', () => {
			// Arrange.
			const { result } = renderHook( () => useLicenseConfig() );

			// Act.
			act( () => {
				setLicenseConfig( { expired: true } );
			} );

			// Assert.
			expect( result.current ).toEqual( {
				expired: true,
			} );
		} );

		it( 'should merge partial config updates', () => {
			// Arrange.
			const { result } = renderHook( () => useLicenseConfig() );

			// Act.
			act( () => {
				setLicenseConfig( { expired: true } );
			} );

			act( () => {
				setLicenseConfig( { expired: false } );
			} );

			// Assert.
			expect( result.current ).toEqual( {
				expired: false,
			} );
		} );

		it( 'should notify multiple subscribers', () => {
			// Arrange.
			const { result: result1 } = renderHook( () => useLicenseConfig() );
			const { result: result2 } = renderHook( () => useLicenseConfig() );

			// Act.
			act( () => {
				setLicenseConfig( { expired: true } );
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
			setLicenseConfig( { expired: false } );
		} );
	} );
} );
