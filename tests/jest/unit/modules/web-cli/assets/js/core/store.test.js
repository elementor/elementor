import Store from 'elementor-api/core/store';
import { createSlice, combineReducers } from '@reduxjs/toolkit';

jest.mock( '@reduxjs/toolkit', () => ( {
	...jest.requireActual( '@reduxjs/toolkit' ),
	combineReducers: jest.fn( () => 'combine-reducers' ),
	configureStore: jest.fn( () => ( {
		replaceReducer: jest.fn(),
	} ) ),
} ) );

// Test `$e.store()`.
describe( '$e.store', () => {
	// Arrange.
	let store, slice1, slice2;

	beforeEach( () => {
		store = new Store();

		slice1 = createSlice( {
			initialState: {},
			reducers: {},
			name: 'slice-1',
		} );

		slice2 = createSlice( {
			initialState: {},
			reducers: {},
			name: 'slice-2',
		} );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'register() -- Registers one slice', () => {
		// Act.
		store.register( 'slice-1', slice1 );

		// Assert.
		expect( store.get( 'slice-1' ) ).toBe( slice1 );
		expect( store.getAllSlices() ).toEqual( { 'slice-1': slice1 } );
		expect( store.getReduxStore().replaceReducer ).toHaveBeenNthCalledWith( 1, 'combine-reducers' );
	} );

	test( 'register() -- Registers multiple slices', () => {
		// Act.
		store.register( 'slice-1', slice1 );
		store.register( 'slice-2', slice2 );

		// Assert.
		expect( store.getAllSlices() ).toEqual( { 'slice-1': slice1, 'slice-2': slice2 } );
		expect( store.getReduxStore().replaceReducer ).toHaveBeenNthCalledWith( 2, 'combine-reducers' );
		expect( combineReducers.mock.calls ).toEqual( [
			[ { 'slice-1': slice1.reducer } ],
			[ { 'slice-1': slice1.reducer, 'slice-2': slice2.reducer } ],
		] );
	} );

	test( 'register() -- Cannot register two slices with same id', () => {
		// Act.
		store.register( 'slice-1', slice1 );

		// Assert.
		expect( () => store.register( 'slice-1', slice2 ) ).toThrowError();
	} );

	test( 'getAll() -- Returns all slices IDs sorted', () => {
		// Act.
		store.register( 'b', slice1 );
		store.register( 'a', slice2 );

		// Assert.
		expect( store.getAll() ).toEqual( [ 'a', 'b' ] );
	} );

	test( 'get() -- Returns a slice by ID', () => {
		// Act.
		store.register( 'slice-1', slice1 );
		store.register( 'slice-2', slice2 );

		// Assert.
		expect( store.get( 'slice-1' ) ).toEqual( slice1 );
	} );

	test( 'getAllSlices() -- Returns all slices', () => {
		// Act.
		store.register( 'slice-1', slice1 );
		store.register( 'slice-2', slice2 );

		// Assert.
		expect( store.getAllSlices() ).toEqual( {
			'slice-1': slice1,
			'slice-2': slice2,
		} );
	} );
} );
