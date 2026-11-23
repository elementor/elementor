import { isAngieEnabled } from '../is-angie-enabled';

describe( 'isAngieEnabled', () => {
	afterEach( () => {
		delete window.elementorEditorAngie;
	} );

	it( 'should be enabled when the host signals Angie is enabled', () => {
		// Arrange
		window.elementorEditorAngie = { isAngieEnabled: true };

		// Act & Assert
		expect( isAngieEnabled() ).toBe( true );
	} );

	it( 'should be disabled when the host signals Angie is disabled', () => {
		// Arrange
		window.elementorEditorAngie = { isAngieEnabled: false };

		// Act & Assert
		expect( isAngieEnabled() ).toBe( false );
	} );

	it( 'should be disabled when consent is missing and the host sends no signal', () => {
		// Arrange
		window.elementorEditorAngie = { isAngiePluginActive: true };

		// Act & Assert
		expect( isAngieEnabled() ).toBe( false );
	} );
} );
