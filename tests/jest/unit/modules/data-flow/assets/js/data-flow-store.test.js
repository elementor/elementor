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

describe( 'createStore typed writes', () => {
	let warn;

	beforeEach( () => {
		warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	const schema = {
		count: { prop_type: 'number' },
		mode: { prop_type: 'enum', options: [ 'a', 'b' ] },
		open: { prop_type: 'boolean' },
	};

	it( 'should coerce valid values to the declared type', () => {
		// Arrange
		const store = createStore( { count: 0, mode: 'a', open: false }, schema );

		// Act
		store.setState( { count: '5', open: 'true' } );

		// Assert
		expect( store.getState() ).toEqual( { count: 5, mode: 'a', open: true } );
	} );

	it( 'should reject invalid values, keep the previous state and warn once per key', () => {
		// Arrange
		const store = createStore( { count: 1, mode: 'a', open: false }, schema );

		// Act
		store.setState( 'count', 'abc' );
		store.setState( 'count', NaN );
		store.setState( 'mode', 'z' );

		// Assert
		expect( store.getState() ).toEqual( { count: 1, mode: 'a', open: false } );
		expect( warn ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should leave keys without a declared type untouched', () => {
		// Arrange
		const store = createStore( {}, schema );

		// Act
		store.setState( 'free', { any: 'thing' } );

		// Assert
		expect( store.getState().free ).toEqual( { any: 'thing' } );
	} );
} );
