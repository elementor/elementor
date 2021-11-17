import Store from 'elementor-common/api/core/store';
import { createSlice, combineReducers } from '@reduxjs/toolkit';

jest.mock( '@reduxjs/toolkit', () => ( {
	...jest.requireActual( '@reduxjs/toolkit' ),
	combineReducers: jest.fn( () => 'combine-reducers' ),
	configureStore: jest.fn( () => ( {
		replaceReducer: jest.fn(),
	} ) ),
} ) );

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

// Test `$e.store()`.
describe( '$e.store', () => {
	test( 'register() -- Registers one slice', () => {
		// Act.
		store.register( 'slice-1', slice1 );

		// Assert.
		expect( store.get( 'slice-1' ) ).toBe( slice1 );
		expect( store.get() ).toEqual( { 'slice-1': slice1 } );
		expect( store.getReduxStore().replaceReducer ).toHaveBeenNthCalledWith( 1, 'combine-reducers' );
	} );

	test( 'register() -- Registers multiple slices', () => {
		// Act.
		store.register( 'slice-1', slice1 );
		store.register( 'slice-2', slice2 );

		// Assert.
		expect( store.get() ).toEqual( { 'slice-1': slice1, 'slice-2': slice2 } );
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
} );
