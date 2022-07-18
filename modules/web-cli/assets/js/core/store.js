import { configureStore, combineReducers } from '@reduxjs/toolkit';

/**
 * @typedef {import('@reduxjs/toolkit').Slice} Slice
 */
/**
 * @typedef {import('@reduxjs/toolkit').EnhancedStore} EnhancedStore
 */
/**
 * @typedef {import('@reduxjs/toolkit').AnyAction} AnyAction
 */
/**
 * @typedef {import('@reduxjs/toolkit').ThunkMiddlewareFor} ThunkMiddlewareFor
 */

export default class Store {
	/**
	 * @type {Object}
	 */
	slices = {};

	/**
	 * @type {EnhancedStore<{}, AnyAction, [ThunkMiddlewareFor<{}>]>}
	 */
	reduxStore;

	/**
	 * Initialize the Store.
	 *
	 * @return {void}
	 */
	constructor() {
		this.slices = {};
		this.reduxStore = this.createStore();
	}

	/**
	 * Create a Redux Store object.
	 *
	 * @return {EnhancedStore<{}, AnyAction, [ThunkMiddlewareFor<{}>]>} store
	 */
	createStore() {
		return configureStore( {
			// Use an empty function instead of empty object since an empty object
			// isn't a valid reducer value.
			reducer: () => {},
		} );
	}

	/**
	 * Inject a new reducer.
	 *
	 * See: https://redux.js.org/usage/code-splitting#defining-an-injectreducer-function
	 *
	 * @param {string}   id         - Reducer unique ID.
	 * @param {Function} newReducer - New reducer to inject.
	 *
	 * @return {void}
	 */
	injectReducer( id, newReducer ) {
		const prevReducers = this.getReducers();

		this.reduxStore.replaceReducer(
			combineReducers( {
				...prevReducers,
				[ id ]: newReducer,
			} ),
		);
	}

	/**
	 * Register a Redux Store slice.
	 *
	 * @param {string} sliceId  - Slice unique ID.
	 * @param {Slice}  instance - Slice object to add.
	 *
	 * @return {void}
	 */
	register( sliceId, instance ) {
		if ( this.slices[ sliceId ] ) {
			throw `Slice with ID '${ sliceId }' already exists.`;
		}

		this.slices[ sliceId ] = instance;

		this.injectReducer( sliceId, instance.reducer );
	}

	/**
	 * Get a specific slice.
	 *
	 * @param {string|null} sliceId - Slice ID to get.
	 *
	 * @return {Slice} slice
	 */
	get( sliceId ) {
		return this.slices[ sliceId ];
	}

	/**
	 * Get all slices.
	 *
	 * @return {Object} slices
	 */
	getAllSlices() {
		return this.slices;
	}

	/**
	 * Get All slices.
	 *
	 * @return {Object} slices
	 */
	getAll() {
		return Object.keys( this.slices ).sort();
	}

	/**
	 * Return the current reducers.
	 *
	 * @return {Object} reducers
	 */
	getReducers() {
		return Object.entries( this.slices )
			.reduce( ( reducers, [ key, slice ] ) => ( {
				...reducers,
				[ key ]: slice.reducer,
			} ), {} );
	}

	/**
	 * Get the actual Redux store object.
	 *
	 * @return {Object} redux store object
	 */
	getReduxStore() {
		return this.reduxStore;
	}

	/**
	 * Proxy to Redux's `dispatch()` function.
	 *
	 * @return {*} the dispatched action
	 */
	dispatch() {
		return this.reduxStore.dispatch( ...arguments );
	}

	/**
	 * Proxy to Redux's `getState()` function, with the ability to get a specific slice.
	 *
	 * @param {string|null} sliceId
	 *
	 * @return {*} The current state tree of the application
	 */
	getState( sliceId = null ) {
		const state = this.reduxStore.getState();

		return sliceId ? state[ sliceId ] : state;
	}

	/**
	 * Proxy to Redux's `replaceReducer()` function.
	 * TODO: Do we want that?
	 *
	 * @return {*} undefined
	 */
	replaceReducer() {
		return this.reduxStore.replaceReducer( ...arguments );
	}

	/**
	 * Proxy to Redux's `subscribe()` function.
	 *
	 * @return {*} A function that unsubscribes the change listener
	 */
	subscribe() {
		return this.reduxStore.subscribe( ...arguments );
	}
}
