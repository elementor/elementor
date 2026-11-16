import * as React from 'react';
import { __flushAllInjections } from '@elementor/locations';
import { renderHook } from '@testing-library/react';

import { injectIntoPanels, usePanelsInjections } from '../location';

describe( 'panels location', () => {
	it( 'should not overwrite keepMounted on duplicate inject', () => {
		// Arrange.
		const FirstPanel = () => <div>First</div>;
		const SecondPanel = () => <div>Second</div>;
		const warnSpy = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );

		injectIntoPanels( {
			id: 'duplicate-panel',
			component: FirstPanel,
			keepMounted: true,
		} );

		// Act.
		injectIntoPanels( {
			id: 'duplicate-panel',
			component: SecondPanel,
			keepMounted: false,
		} );

		warnSpy.mockRestore();

		const { result } = renderHook( () => usePanelsInjections() );

		// Assert.
		expect( result.current ).toHaveLength( 1 );
		expect( result.current[ 0 ].id ).toBe( 'duplicate-panel' );
		expect( result.current[ 0 ].keepMounted ).toBe( true );
	} );

	it( 'should clear panelsMeta when injections are flushed', () => {
		// Arrange.
		injectIntoPanels( {
			id: 'flushable-panel',
			component: () => <div>Flushable</div>,
			keepMounted: true,
		} );

		const { result: beforeFlush, unmount } = renderHook( () => usePanelsInjections() );

		expect( beforeFlush.current ).toHaveLength( 1 );
		expect( beforeFlush.current[ 0 ].keepMounted ).toBe( true );

		unmount();

		// Act.
		__flushAllInjections();

		injectIntoPanels( {
			id: 'flushable-panel',
			component: () => <div>Flushable</div>,
			keepMounted: false,
		} );

		const { result: afterFlush } = renderHook( () => usePanelsInjections() );

		// Assert.
		expect( afterFlush.current ).toHaveLength( 1 );
		expect( afterFlush.current[ 0 ].keepMounted ).toBe( false );
	} );
} );
