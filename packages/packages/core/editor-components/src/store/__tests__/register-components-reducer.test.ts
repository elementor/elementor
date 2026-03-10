import { __createStore, __dispatch as dispatch, __registerSlice as registerSlice, type Store } from '@elementor/store';

import type { ComponentsState } from '../store';
import { __resetExtraReducers, createComponentsAction, registerComponentsReducer, slice } from '../store';

type StoreType = Store< { components: ComponentsState } >;

describe( 'registerComponentsReducer', () => {
	afterEach( () => {
		__resetExtraReducers();
	} );

	it( 'should run registered reducer when matching action is dispatched', () => {
		// Arrange
		registerComponentsReducer< { value: string } >( 'components/customAction', ( state, action ) => {
			state.updatedComponentNames = { 1: action.payload.value };
		} );

		registerSlice( slice );
		const store: StoreType = __createStore();

		// Act
		dispatch( { type: 'components/customAction', payload: { value: 'custom-value' } } );

		// Assert
		const state = store.getState();
		expect( state.components.updatedComponentNames ).toEqual( { 1: 'custom-value' } );
	} );

	it( 'should not affect base slice reducers', () => {
		// Arrange
		registerSlice( slice );
		const store: StoreType = __createStore();

		// Act
		dispatch( slice.actions.addCreatedThisSession( 'uid-123' ) );

		// Assert
		const state = store.getState();
		expect( state.components.createdThisSession ).toEqual( [ 'uid-123' ] );
	} );

	it( 'should allow multiple custom reducers', () => {
		// Arrange
		registerComponentsReducer< string >( 'components/actionA', ( state, action ) => {
			state.createdThisSession.push( action.payload );
		} );

		registerComponentsReducer< string >( 'components/actionB', ( state, action ) => {
			state.archivedThisSession.push( Number( action.payload ) );
		} );

		registerSlice( slice );
		const store: StoreType = __createStore();

		// Act
		dispatch( { type: 'components/actionA', payload: 'uid-a' } );
		dispatch( { type: 'components/actionB', payload: '42' } );

		// Assert
		const state = store.getState();
		expect( state.components.createdThisSession ).toEqual( [ 'uid-a' ] );
		expect( state.components.archivedThisSession ).toEqual( [ 42 ] );
	} );
} );

describe( 'createComponentsAction', () => {
	afterEach( () => {
		__resetExtraReducers();
	} );

	it( 'should create, register, and dispatch in one flow', () => {
		// Arrange
		const myAction = createComponentsAction< { name: string } >( 'myAction' );

		myAction.register( ( state, action ) => {
			state.updatedComponentNames = { 1: action.payload.name };
		} );

		registerSlice( slice );
		const store: StoreType = __createStore();

		// Act
		myAction.dispatch( { name: 'test-name' } );

		// Assert
		expect( store.getState().components.updatedComponentNames ).toEqual( { 1: 'test-name' } );
	} );

	it( 'should create action with correct type prefix', () => {
		// Arrange
		const myAction = createComponentsAction< string >( 'someAction' );

		// Assert
		expect( myAction.action.type ).toBe( 'components/someAction' );
	} );
} );
