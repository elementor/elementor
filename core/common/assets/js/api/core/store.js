import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

export default class Store {
	/**
	 * Initialize the Store.
	 *
	 * @return {void}
	 */
	constructor() {
		this.slices = {};
		this.reduxStore = this.createStore();
		this.provider = <Provider store={ this.reduxStore } />;
	}

	/**
	 * Create a Redux Store object.
	 *
	 * @return {EnhancedStore<{}, AnyAction, [ThunkMiddlewareFor<{}>]>}
	 */
	createStore() {
		const store = configureStore( {
			// Use an empty function instead of empty object since an empty object
			// isn't a valid reducer value.
			reducer: () => {},
		} );

		// See: https://redux.js.org/usage/code-splitting#defining-an-injectreducer-function
		store.asyncReducers = {};

		store.injectReducer = ( key, newReducer ) => {
			store.asyncReducers[ key ] = newReducer;

			store.replaceReducer( combineReducers( { ...store.asyncReducers } ) );
		};

		return store;
	}

	/**
	 * Register a Redux Store slice.
	 *
	 * @param {string} sliceId - Slice unique ID.
	 * @param {Slice} instance - Slice object to add.
	 *
	 * @return {void}
	 */
	register( sliceId, instance ) {
		if ( this.slices[ sliceId ] ) {
			throw `Slice with ID '${ sliceId }' already exists.`;
		}

		this.slices[ sliceId ] = instance;

		this.reduxStore.injectReducer( sliceId, instance.reducer );
	}

	/**
	 * Get a specific slice.
	 *
	 * @param {string} sliceId - Slice ID to get.
	 *
	 * @return {Slice|Object}
	 */
	get( sliceId ) {
		if ( sliceId ) {
			return this.slices[ sliceId ];
		}

		return this.slices;
	}

	/**
	 * Get All slices.
	 *
	 * @return {Object}
	 */
	getAll() {
		return Object.keys( this.slices );
	}

	/**
	 * Get the actual Redux store object.
	 *
	 * @return {Object}
	 */
	getReduxStore() {
		return this.reduxStore;
	}

	/**
	 * Proxy to Redux's `dispatch()` function.
	 *
	 * @return {*}
	 */
	dispatch() {
		return this.reduxStore.dispatch( ...arguments );
	}

	/**
	 * Proxy to Redux's `getState()` function.
	 *
	 * @return {*}
	 */
	getState() {
		return this.reduxStore.getState( ...arguments );
	}

	/**
	 * Proxy to Redux's `replaceReducer()` function.
	 * TODO: Do we want that?
	 *
	 * @return {*}
	 */
	replaceReducer() {
		return this.reduxStore.replaceReducer( ...arguments );
	}

	/**
	 * Proxy to Redux's `subscribe()` function.
	 *
	 * @return {*}
	 */
	subscribe() {
		return this.reduxStore.subscribe( ...arguments );
	}
}
