import { createStore } from 'elementor/modules/data-flow/assets/js/data-flow-store';

describe( 'createStore', () => {
	it( 'should expose the initial state', () => {
		// Arrange
		const store = createStore( { count: 1 } );

		// Act
		const state = store.getState();

		// Assert
		expect( state ).toEqual( { count: 1 } );
	} );

	it( 'should set a single key and notify its listeners', () => {
		// Arrange
		const store = createStore( { count: 1 } );
		const listener = jest.fn();
		store.subscribe( 'count', listener );

		// Act
		store.setState( 'count', 2 );

		// Assert
		expect( store.getState().count ).toBe( 2 );
		expect( listener ).toHaveBeenCalledWith( 2, 'count', { count: 2 } );
	} );

	it( 'should support an updater function', () => {
		// Arrange
		const store = createStore( { count: 1 } );

		// Act
		store.setState( 'count', ( previous ) => previous + 10 );

		// Assert
		expect( store.getState().count ).toBe( 11 );
	} );

	it( 'should merge a partial state object and notify wildcard listeners per changed key', () => {
		// Arrange
		const store = createStore( { a: 1, b: 2 } );
		const anyListener = jest.fn();
		store.subscribe( '*', anyListener );

		// Act
		store.setState( { a: 1, b: 3, c: 4 } );

		// Assert
		expect( store.getState() ).toEqual( { a: 1, b: 3, c: 4 } );
		expect( anyListener ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should not notify when the value did not change', () => {
		// Arrange
		const store = createStore( { count: 1 } );
		const listener = jest.fn();
		store.subscribe( 'count', listener );

		// Act
		store.setState( 'count', 1 );

		// Assert
		expect( listener ).not.toHaveBeenCalled();
	} );

	it( 'should stop notifying after unsubscribe', () => {
		// Arrange
		const store = createStore( { count: 1 } );
		const listener = jest.fn();
		const unsubscribe = store.subscribe( 'count', listener );

		// Act
		unsubscribe();
		store.setState( 'count', 2 );

		// Assert
		expect( listener ).not.toHaveBeenCalled();
	} );
} );
