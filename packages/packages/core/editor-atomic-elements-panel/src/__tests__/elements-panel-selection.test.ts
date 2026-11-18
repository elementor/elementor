import { getElementsPanelSelection, setElementsPanelSelection } from '../elements-panel-selection';

const STORAGE_KEY = 'elementor:new-experience:elements-panel';

describe( 'elements panel selection', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	it( 'should default to atomic when nothing is saved', () => {
		// Act & Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
	} );

	it( 'should default to atomic when the saved value is invalid', () => {
		// Arrange.
		window.localStorage.setItem( STORAGE_KEY, 'invalid' );

		// Act & Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
	} );

	it( 'should persist and read the selection', () => {
		// Act.
		setElementsPanelSelection( 'non_atomic' );

		// Assert.
		expect( window.localStorage.getItem( STORAGE_KEY ) ).toBe( 'non_atomic' );
		expect( getElementsPanelSelection() ).toBe( 'non_atomic' );
	} );

	it( 'should not throw when storage is blocked', () => {
		// Arrange.
		jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );

		// Act & Assert.
		expect( getElementsPanelSelection() ).toBe( 'atomic' );
		expect( () => setElementsPanelSelection( 'non_atomic' ) ).not.toThrow();

		jest.restoreAllMocks();
	} );
} );
