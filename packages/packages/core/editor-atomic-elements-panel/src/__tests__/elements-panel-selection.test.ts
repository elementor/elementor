import type * as Selection from '../elements-panel-selection';

const STORAGE_KEY = 'elementor:new-experience:elements-panel';

type SelectionModule = typeof Selection;

function loadModule(): SelectionModule {
	let module!: SelectionModule;

	jest.isolateModules( () => {
		module = require( '../elements-panel-selection' );
	} );

	return module;
}

describe( 'elements panel selection', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'should default to atomic when nothing is saved', () => {
		// Arrange.
		const { getElementsPanelSelection } = loadModule();

		// Act & Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
	} );

	it( 'should default to atomic when the saved value is invalid', () => {
		// Arrange.
		window.localStorage.setItem( STORAGE_KEY, 'invalid' );
		const { getElementsPanelSelection } = loadModule();

		// Act & Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
	} );

	it( 'should persist and read the selection', () => {
		// Arrange.
		const { getElementsPanelSelection, setElementsPanelSelection } = loadModule();

		// Act.
		setElementsPanelSelection( 'non_atomic' );

		// Assert.
		expect( window.localStorage.getItem( STORAGE_KEY ) ).toBe( 'non_atomic' );
		expect( getElementsPanelSelection() ).toBe( 'non_atomic' );
		expect( loadModule().getElementsPanelSelection() ).toBe( 'non_atomic' );
	} );

	it( 'should keep the selection when storage is blocked', () => {
		// Arrange.
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );
		const { getElementsPanelSelection, setElementsPanelSelection } = loadModule();

		// Act & Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
		expect( () => setElementsPanelSelection( 'non_atomic' ) ).not.toThrow();
		expect( getElementsPanelSelection() ).toBe( 'non_atomic' );
	} );
} );
