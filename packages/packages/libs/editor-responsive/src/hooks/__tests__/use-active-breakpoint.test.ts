import { dispatchWindowEvent } from 'test-utils';
import { act, renderHook } from '@testing-library/react';

import { type BreakpointId, type ExtendedWindow } from '../../types';
import { useActiveBreakpoint } from '../use-active-breakpoint';

describe( 'useActiveBreakpoint', () => {
	function setActiveBreakpoint( active: BreakpointId ) {
		const extendedWindow = window as unknown as ExtendedWindow;

		extendedWindow.elementor = {
			channels: {
				deviceMode: {
					request: () => {
						return active;
					},
				},
			},
		};

		dispatchWindowEvent( 'elementor/device-mode/change' );
	}

	it( 'should return null when no breakpoint is active', () => {
		// Arrange.
		setActiveBreakpoint( undefined as never );

		// Act.
		const { result } = renderHook( useActiveBreakpoint );

		// Assert.
		expect( result.current ).toEqual( null );
	} );

	it( 'should return the active breakpoint', () => {
		// Arrange.
		setActiveBreakpoint( 'mobile' );

		// Act.
		const { result } = renderHook( useActiveBreakpoint );

		// Assert.
		expect( result.current ).toEqual( 'mobile' );

		// Act.
		act( () => setActiveBreakpoint( 'tablet' ) );

		// Assert.
		expect( result.current ).toEqual( 'tablet' );
	} );
} );
