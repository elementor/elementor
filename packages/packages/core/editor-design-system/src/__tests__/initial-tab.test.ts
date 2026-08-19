import type * as InitialTabModule from '../initial-tab';

type InitialTab = typeof InitialTabModule;

const STORAGE_KEY = 'elementor_editor_design_system_active_tab';

function loadModule(): InitialTab {
	jest.resetModules();

	return require( '../initial-tab' ) as InitialTab;
}

let mod: InitialTab;

beforeEach( () => {
	localStorage.clear();
	mod = loadModule();
} );

describe( 'getInitialDesignSystemTab — reading from localStorage', () => {
	it( 'returns "variables" when localStorage is empty', () => {
		expect( mod.getInitialDesignSystemTab() ).toBe( 'variables' );
	} );

	it( 'returns "classes" when localStorage contains "classes"', () => {
		localStorage.setItem( STORAGE_KEY, 'classes' );
		mod = loadModule();
		expect( mod.getInitialDesignSystemTab() ).toBe( 'classes' );
	} );

	it( 'returns "variables" when localStorage contains "variables"', () => {
		localStorage.setItem( STORAGE_KEY, 'variables' );
		mod = loadModule();
		expect( mod.getInitialDesignSystemTab() ).toBe( 'variables' );
	} );

	it( 'falls back to "variables" for an unrecognised stored value', () => {
		localStorage.setItem( STORAGE_KEY, 'something-invalid' );
		mod = loadModule();
		expect( mod.getInitialDesignSystemTab() ).toBe( 'variables' );
	} );
} );

describe( 'getInitialDesignSystemTab — pending tab (key new behaviour)', () => {
	it( 'returns the pending tab instead of the stored one', () => {
		localStorage.setItem( STORAGE_KEY, 'variables' );
		mod.setPendingDesignSystemTab( 'classes' );

		expect( mod.getInitialDesignSystemTab() ).toBe( 'classes' );
	} );

	it( 'persists the pending tab to localStorage when consuming it', () => {
		mod.setPendingDesignSystemTab( 'classes' );
		mod.getInitialDesignSystemTab();

		expect( localStorage.getItem( STORAGE_KEY ) ).toBe( 'classes' );
	} );

	it( 'clears the pending tab after consuming it, and the persisted value is used on the next call', () => {
		localStorage.setItem( STORAGE_KEY, 'variables' );
		mod.setPendingDesignSystemTab( 'classes' );

		mod.getInitialDesignSystemTab();

		expect( mod.getInitialDesignSystemTab() ).toBe( 'classes' );
	} );

	it( 'updates activeTabInMemory to the pending tab when consuming', () => {
		mod.setPendingDesignSystemTab( 'classes' );
		mod.getInitialDesignSystemTab();

		expect( mod.getActiveDesignSystemTab() ).toBe( 'classes' );
	} );
} );

describe( 'notifyDesignSystemTabChange and getActiveDesignSystemTab', () => {
	it( 'getActiveDesignSystemTab returns the initial stored value on fresh load', () => {
		localStorage.setItem( STORAGE_KEY, 'classes' );
		mod = loadModule();

		expect( mod.getActiveDesignSystemTab() ).toBe( 'classes' );
	} );

	it( 'getActiveDesignSystemTab updates after notifyDesignSystemTabChange', () => {
		mod.notifyDesignSystemTabChange( 'classes' );

		expect( mod.getActiveDesignSystemTab() ).toBe( 'classes' );
	} );

	it( 'notifyDesignSystemTabChange does NOT write to localStorage', () => {
		mod.notifyDesignSystemTabChange( 'classes' );

		expect( localStorage.getItem( STORAGE_KEY ) ).toBeNull();
	} );
} );

describe( 'persistDesignSystemTab', () => {
	it( 'writes the tab value to localStorage', () => {
		mod.persistDesignSystemTab( 'classes' );

		expect( localStorage.getItem( STORAGE_KEY ) ).toBe( 'classes' );
	} );

	it( 'overwrites an existing stored value', () => {
		localStorage.setItem( STORAGE_KEY, 'classes' );
		mod.persistDesignSystemTab( 'variables' );

		expect( localStorage.getItem( STORAGE_KEY ) ).toBe( 'variables' );
	} );

	it( 'does NOT update activeTabInMemory (only notifyDesignSystemTabChange does that)', () => {
		mod.persistDesignSystemTab( 'classes' );

		expect( mod.getActiveDesignSystemTab() ).toBe( 'variables' );
	} );
} );
