import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { act, renderHook } from '@testing-library/react';

import type * as Selection from '../elements-panel-selection';
import type * as LegacyMode from '../legacy-mode';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	isExperimentActive: jest.fn(),
} ) );

const STORAGE_KEY = 'elementor:new-experience:elements-panel';

type Api = typeof LegacyMode & typeof Selection;

function loadApi(): Api {
	let api!: Api;

	// Isolated modules must share the test renderer's React, or hooks break.
	const react = jest.requireActual( 'react' );

	jest.isolateModules( () => {
		jest.doMock( 'react', () => react );
		api = require( '../legacy-mode' );
		Object.assign( api, require( '../elements-panel-selection' ) );
	} );

	return api;
}

function mockExperiments( v4: boolean, atomicPanel: boolean ) {
	jest.mocked( isExperimentActive ).mockImplementation( ( name ) => {
		if ( name === 'e_atomic_elements' ) {
			return v4;
		}

		return name === 'e_editor_atomic_panel' ? atomicPanel : false;
	} );
}

describe( 'legacy elements panel mode', () => {
	beforeEach( () => {
		window.localStorage.clear();
		mockExperiments( true, true );
	} );

	it( 'should be legacy only when both experiments are on and non_atomic is selected', () => {
		// Arrange.
		window.localStorage.setItem( STORAGE_KEY, 'non_atomic' );
		const { isLegacyElementsPanelSelected } = loadApi();

		// Act & Assert.
		expect( isLegacyElementsPanelSelected() ).toBe( true );
	} );

	it.each( [
		[ false, true ],
		[ true, false ],
	] )( 'should not be legacy when experiments are v4=%s atomicPanel=%s', ( v4, atomicPanel ) => {
		// Arrange.
		mockExperiments( v4, atomicPanel );
		window.localStorage.setItem( STORAGE_KEY, 'non_atomic' );
		const { isLegacyElementsPanelSelected } = loadApi();

		// Act & Assert.
		expect( isLegacyElementsPanelSelected() ).toBe( false );
	} );

	it( 'should not be legacy when atomic is selected', () => {
		// Arrange.
		const { isLegacyElementsPanelSelected } = loadApi();

		// Act & Assert.
		expect( isLegacyElementsPanelSelected() ).toBe( false );
	} );

	it( 'should flip the hook value when the selection changes', () => {
		// Arrange.
		const { useIsLegacyElementsPanelSelected, setElementsPanelSelection } = loadApi();
		const { result } = renderHook( () => useIsLegacyElementsPanelSelected() );

		// Assert.
		expect( result.current ).toBe( false );

		// Act.
		act( () => setElementsPanelSelection( 'non_atomic' ) );

		// Assert.
		expect( result.current ).toBe( true );

		// Act.
		act( () => setElementsPanelSelection( 'atomic' ) );

		// Assert.
		expect( result.current ).toBe( false );
	} );

	describe( 'useOnSwitchToLegacyElementsPanel', () => {
		it( 'should not call back on mount when already non_atomic', () => {
			// Arrange.
			window.localStorage.setItem( STORAGE_KEY, 'non_atomic' );
			const { useOnSwitchToLegacyElementsPanel } = loadApi();
			const callback = jest.fn();

			// Act.
			renderHook( () => useOnSwitchToLegacyElementsPanel( callback ) );

			// Assert.
			expect( callback ).not.toHaveBeenCalled();
		} );

		it( 'should call back once on atomic to non_atomic and not on the way back', () => {
			// Arrange.
			const { useOnSwitchToLegacyElementsPanel, setElementsPanelSelection } = loadApi();
			const callback = jest.fn();

			renderHook( () => useOnSwitchToLegacyElementsPanel( callback ) );

			// Act.
			act( () => setElementsPanelSelection( 'non_atomic' ) );

			// Assert.
			expect( callback ).toHaveBeenCalledTimes( 1 );

			// Act.
			act( () => setElementsPanelSelection( 'atomic' ) );

			// Assert.
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not call back when the gate is off', () => {
			// Arrange.
			mockExperiments( true, false );
			const { useOnSwitchToLegacyElementsPanel, setElementsPanelSelection } = loadApi();
			const callback = jest.fn();

			renderHook( () => useOnSwitchToLegacyElementsPanel( callback ) );

			// Act.
			act( () => setElementsPanelSelection( 'non_atomic' ) );

			// Assert.
			expect( callback ).not.toHaveBeenCalled();
		} );
	} );
} );
