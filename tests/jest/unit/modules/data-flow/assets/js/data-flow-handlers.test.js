import { attachHandlers } from 'elementor/modules/data-flow/assets/js/data-flow-handlers';
import { createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';

describe( 'attachHandlers', () => {
	beforeEach( () => {
		document.body.innerHTML = '<button data-interaction-id="btn1">Click</button>';
	} );

	it( 'should run init handlers immediately with the element and store', () => {
		// Arrange
		const store = createStore( { label: 'ready' } );

		// Act
		attachHandlers( [ {
			elementId: 'btn1',
			handlers: [ { event: 'init', code: 'element.textContent = state.label;' } ],
		} ], store, document );

		// Assert
		expect( document.querySelector( 'button' ).textContent ).toBe( 'ready' );
	} );

	it( 'should run DOM event handlers that update the state', () => {
		// Arrange
		const store = createStore( { count: 0 } );
		attachHandlers( [ {
			elementId: 'btn1',
			handlers: [ { event: 'click', code: 'setState( "count", ( c ) => c + 1 );' } ],
		} ], store, document );

		// Act
		document.querySelector( 'button' ).click();
		document.querySelector( 'button' ).click();

		// Assert
		expect( store.getState().count ).toBe( 2 );
	} );

	it( 'should allow handlers to subscribe to state changes', () => {
		// Arrange
		const store = createStore( { count: 0 } );
		attachHandlers( [ {
			elementId: 'btn1',
			handlers: [ { event: 'init', code: 'subscribe( "count", ( value ) => { element.dataset.count = value; } );' } ],
		} ], store, document );

		// Act
		store.setState( 'count', 3 );

		// Assert
		expect( document.querySelector( 'button' ).dataset.count ).toBe( '3' );
	} );

	it( 'should run each element against the store resolved for it', () => {
		// Arrange
		document.body.innerHTML = '<button id="a" data-interaction-id="btn1">A</button><button id="b" data-interaction-id="btn1">B</button>';
		const stores = { a: createStore( { label: 'first' } ), b: createStore( { label: 'second' } ) };

		// Act
		attachHandlers( [ {
			elementId: 'btn1',
			handlers: [ { event: 'init', code: 'element.textContent = state.label;' } ],
		} ], ( element ) => stores[ element.id ], document );

		// Assert
		expect( document.getElementById( 'a' ).textContent ).toBe( 'first' );
		expect( document.getElementById( 'b' ).textContent ).toBe( 'second' );
	} );

	it( 'should isolate errors thrown by a handler', () => {
		// Arrange
		const store = createStore( { count: 0 } );
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		// Act
		attachHandlers( [ {
			elementId: 'btn1',
			handlers: [
				{ event: 'init', code: 'throw new Error( "boom" );' },
				{ event: 'init', code: 'setState( "count", 1 );' },
				{ event: 'init', code: 'this is not valid javascript' },
			],
		} ], store, document );

		// Assert
		expect( store.getState().count ).toBe( 1 );
		expect( consoleError ).toHaveBeenCalledTimes( 2 );

		consoleError.mockRestore();
	} );
} );
