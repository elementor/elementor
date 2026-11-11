import {
	isAngieTextControlType,
	tryOpenAngieForTextControl,
} from 'elementor/modules/ai/assets/js/editor/angie/open-angie-text';

describe( 'tryOpenAngieForTextControl', () => {
	let openAngie;

	beforeEach( () => {
		openAngie = jest.fn( () => Promise.resolve() );
		window.elementorV2 = {
			editorAngie: {
				openAngie,
				AngieInteractionMode: {
					AGENT: 'agent',
					ASK: 'ask',
				},
			},
		};
	} );

	afterEach( () => {
		delete window.elementorV2;
		jest.clearAllMocks();
	} );

	it( 'opens Angie with a built-in prompt when editor-angie is loaded for a text control', () => {
		// Arrange
		const getControlValue = jest.fn( () => 'Hello' );

		// Act
		const handled = tryOpenAngieForTextControl( {
			type: 'text',
			controlType: 'text',
			getControlValue,
			context: {
				elementId: 'abc123',
				controlName: 'title',
			},
		} );

		// Assert
		expect( handled ).toBe( true );
		expect( openAngie ).toHaveBeenCalledTimes( 1 );
		expect( openAngie ).toHaveBeenCalledWith( {
			prompt: expect.stringContaining( 'abc123' ),
			mode: 'agent',
		} );
		expect( openAngie.mock.calls[ 0 ][ 0 ].prompt ).toContain( 'title' );
		expect( openAngie.mock.calls[ 0 ][ 0 ].prompt ).toContain( 'Hello' );
	} );

	it( 'falls back to the old modal when editor-angie is not loaded', () => {
		// Arrange
		delete window.elementorV2.editorAngie;

		// Act
		const handled = tryOpenAngieForTextControl( {
			type: 'text',
			controlType: 'text',
			getControlValue: () => 'Hello',
			context: { elementId: 'abc123', controlName: 'title' },
		} );

		// Assert
		expect( handled ).toBe( false );
		expect( openAngie ).not.toHaveBeenCalled();
	} );

	it( 'does not open Angie for excerpt or media types', () => {
		// Arrange / Act / Assert
		expect( tryOpenAngieForTextControl( {
			type: 'excerpt',
			controlType: 'textarea',
			getControlValue: () => 'Hello',
			context: { elementId: 'abc123', controlName: 'excerpt' },
		} ) ).toBe( false );

		expect( tryOpenAngieForTextControl( {
			type: 'media',
			controlType: 'media',
			getControlValue: () => ( {} ),
			context: { elementId: 'abc123', controlName: 'image' },
		} ) ).toBe( false );

		expect( openAngie ).not.toHaveBeenCalled();
	} );

	it( 'recognizes text and textarea AI types only', () => {
		expect( isAngieTextControlType( 'text' ) ).toBe( true );
		expect( isAngieTextControlType( 'textarea' ) ).toBe( true );
		expect( isAngieTextControlType( 'excerpt' ) ).toBe( false );
		expect( isAngieTextControlType( 'code' ) ).toBe( false );
	} );
} );
