import {
	isAngieTextControlType,
	tryOpenAngieForTextControl,
} from 'elementor/modules/ai/assets/js/editor/angie/open-angie-text';

const flushPromises = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'tryOpenAngieForTextControl', () => {
	let openAngie;

	beforeEach( () => {
		openAngie = jest.fn( () => Promise.resolve() );
		window.ElementorAiConfig = { is_angie_text_enabled: true };
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
		delete window.ElementorAiConfig;
		jest.restoreAllMocks();
	} );

	it( 'opens Angie with a built-in prompt when editor-angie is loaded for a text control', async () => {
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
		await flushPromises();

		// Assert
		expect( handled ).toBe( true );
		expect( openAngie ).toHaveBeenCalledTimes( 1 );
		expect( openAngie ).toHaveBeenCalledWith( {
			prompt: expect.stringContaining( 'abc123' ),
			mode: 'agent',
		} );
		expect( openAngie.mock.calls[ 0 ][ 0 ].prompt ).toContain( 'title' );
		expect( openAngie.mock.calls[ 0 ][ 0 ].prompt ).not.toContain( 'Hello' );
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

	it( 'falls back to the old modal when the Angie experiment is off', () => {
		// Arrange
		window.ElementorAiConfig.is_angie_text_enabled = false;

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

	it( 'falls back to the old modal for repeater items', () => {
		// Act
		const handled = tryOpenAngieForTextControl( {
			type: 'text',
			controlType: 'text',
			getControlValue: () => 'Hello',
			context: { elementId: 'row1', controlName: 'title', isRepeaterItem: true },
		} );

		// Assert
		expect( handled ).toBe( false );
		expect( openAngie ).not.toHaveBeenCalled();
	} );

	it( 'calls onFallback when opening Angie fails', async () => {
		// Arrange
		openAngie.mockImplementation( () => Promise.reject( new Error( 'boom' ) ) );
		const onFallback = jest.fn();
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		// Act
		const handled = tryOpenAngieForTextControl( {
			type: 'text',
			controlType: 'text',
			getControlValue: () => 'Hello',
			context: { elementId: 'abc123', controlName: 'title' },
			onFallback,
		} );
		await flushPromises();

		// Assert
		expect( handled ).toBe( true );
		expect( onFallback ).toHaveBeenCalledTimes( 1 );
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
