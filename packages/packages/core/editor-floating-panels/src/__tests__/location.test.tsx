import * as React from 'react';
import { __flushAllInjections } from '@elementor/locations';
import { renderHook } from '@testing-library/react';

import { injectIntoFloatingPanels, useFloatingPanelsInjections } from '../location';

describe( 'floating panels location', () => {
	it( 'should not overwrite keepMounted on duplicate inject', () => {
		// Arrange.
		const FirstPanel = () => <div>First</div>;
		const SecondPanel = () => <div>Second</div>;
		const warnSpy = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );

		injectIntoFloatingPanels( {
			id: 'duplicate-panel',
			component: FirstPanel,
			keepMounted: true,
		} );

		// Act.
		injectIntoFloatingPanels( {
			id: 'duplicate-panel',
			component: SecondPanel,
			keepMounted: false,
		} );

		warnSpy.mockRestore();

		const { result } = renderHook( () => useFloatingPanelsInjections() );

		// Assert.
		expect( result.current ).toHaveLength( 1 );
		expect( result.current[ 0 ].id ).toBe( 'duplicate-panel' );
		expect( result.current[ 0 ].keepMounted ).toBe( true );
	} );

	it( 'should default keepMounted to false when it is omitted', () => {
		// Arrange.
		injectIntoFloatingPanels( {
			id: 'default-panel',
			component: () => <div>Default</div>,
		} );

		// Act.
		const { result } = renderHook( () => useFloatingPanelsInjections() );

		// Assert.
		expect( result.current ).toHaveLength( 1 );
		expect( result.current[ 0 ].keepMounted ).toBe( false );
	} );

	it( 'should clear the keepMounted meta when injections are flushed', () => {
		// Arrange.
		injectIntoFloatingPanels( {
			id: 'flushable-panel',
			component: () => <div>Flushable</div>,
			keepMounted: true,
		} );

		const { result: beforeFlush, unmount } = renderHook( () => useFloatingPanelsInjections() );

		expect( beforeFlush.current ).toHaveLength( 1 );
		expect( beforeFlush.current[ 0 ].keepMounted ).toBe( true );

		unmount();

		// Act.
		__flushAllInjections();

		injectIntoFloatingPanels( {
			id: 'flushable-panel',
			component: () => <div>Flushable</div>,
			keepMounted: false,
		} );

		const { result: afterFlush } = renderHook( () => useFloatingPanelsInjections() );

		// Assert.
		expect( afterFlush.current ).toHaveLength( 1 );
		expect( afterFlush.current[ 0 ].keepMounted ).toBe( false );
	} );
} );
