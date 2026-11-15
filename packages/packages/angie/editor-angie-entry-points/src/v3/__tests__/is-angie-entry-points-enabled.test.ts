import { isAngieEntryPointsEnabled } from '../is-angie-entry-points-enabled';

describe( 'isAngieEntryPointsEnabled', () => {
	const originalElementorV2 = window.elementorV2;
	const originalElementorEditorAngie = window.elementorEditorAngie;

	afterEach( () => {
		window.elementorV2 = originalElementorV2;
		window.elementorEditorAngie = originalElementorEditorAngie;
	} );

	it( 'returns true when editorAngie.openAngie is present and showEntryPoints is true', () => {
		// Arrange
		window.elementorEditorAngie = { showEntryPoints: true };
		window.elementorV2 = {
			editorAngie: {
				openAngie: jest.fn(),
			},
		};

		// Act
		const enabled = isAngieEntryPointsEnabled();

		// Assert
		expect( enabled ).toBe( true );
	} );

	it( 'returns false when showEntryPoints is false even if openAngie is present', () => {
		// Arrange
		window.elementorEditorAngie = { showEntryPoints: false };
		window.elementorV2 = {
			editorAngie: {
				openAngie: jest.fn(),
			},
		};

		// Act
		const enabled = isAngieEntryPointsEnabled();

		// Assert
		expect( enabled ).toBe( false );
	} );

	it( 'returns false when openAngie is missing', () => {
		// Arrange
		window.elementorV2 = {};

		// Act
		const enabled = isAngieEntryPointsEnabled();

		// Assert
		expect( enabled ).toBe( false );
	} );

	it( 'returns false when elementorV2 is undefined', () => {
		// Arrange
		window.elementorV2 = undefined;

		// Act
		const enabled = isAngieEntryPointsEnabled();

		// Assert
		expect( enabled ).toBe( false );
	} );
} );
