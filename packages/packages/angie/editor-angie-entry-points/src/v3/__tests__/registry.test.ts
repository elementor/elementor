import { clearV3AngieControls, getV3AngieControl, registerV3AngieControl } from '../registry';

describe( 'registry', () => {
	afterEach( () => {
		clearV3AngieControls();
	} );

	it( 'registers and retrieves control by ai type', () => {
		// Arrange
		const registration = {
			types: [ 'text' ],
			buildPrompt: () => 'prompt',
		};

		// Act
		registerV3AngieControl( registration );

		// Assert
		expect( getV3AngieControl( 'text' ) ).toBe( registration );
	} );

	it( 'clears all registrations', () => {
		// Arrange
		registerV3AngieControl( {
			types: [ 'text' ],
			buildPrompt: () => 'prompt',
		} );

		// Act
		clearV3AngieControls();

		// Assert
		expect( getV3AngieControl( 'text' ) ).toBeUndefined();
	} );

	it( 'last registration wins for the same type', () => {
		// Arrange
		const first = {
			types: [ 'text' ],
			buildPrompt: () => 'first',
		};
		const second = {
			types: [ 'text' ],
			buildPrompt: () => 'second',
		};

		// Act
		registerV3AngieControl( first );
		registerV3AngieControl( second );

		// Assert
		expect( getV3AngieControl( 'text' ) ).toBe( second );
	} );
} );
