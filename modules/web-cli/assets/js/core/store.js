import { configureStore, combineReducers } from '@reduxjs/toolkit';

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
	 * @return {EnhancedStore<{}, AnyAction, [ThunkMiddlewareFor<{}>]>}
	 */
	createStore() {
		return configureStore( {
			// Use an empty function instead of empty object since an empty object
			// isn't a valid reducer value.
			reducer: () => {},
			middleware: ( getDefaultMiddleware ) => getDefaultMiddleware( {
				/**
				 * Sometimes there are console warnings about time-consuming (32ms+) Redux middlewares (serializable,
				 * immutable) for certain reducers in development mode. When running QUnit, it causes it to be "done
				 * with warnings", and therefore in testing mode those middlewares should be deactivated.
				 *
				 * @see QUnit `EditorBootstrap` class, where the middlewares are disabled.
				 */
				...( elementorCommonConfig.isTesting ? {
					immutableCheck: false,
					serializableCheck: false,
				} : {} ),
			} ),
		} );
	}

	/**
	 * Inject a new reducer.
	 *
	 * See: https://redux.js.org/usage/code-splitting#defining-an-injectreducer-function
	 *
	 * @param {string} id - Reducer unique ID.
	 * @param {function} newReducer - New reducer to inject.
	 *
	 * @return {void}
	 */
	injectReducer( id, newReducer ) {
		const prevReducers = this.getReducers();

		this.reduxStore.replaceReducer(
			combineReducers( {
				...prevReducers,
				[ id ]: newReducer,
			} )
		);
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

		this.injectReducer( sliceId, instance.reducer );
	}

	/**
	 * Get a specific slice.
	 *
	 * @param {string|null} sliceId - Slice ID to get.
	 *
	 * @return {Slice}
	 */
	get( sliceId ) {
		return this.slices[ sliceId ];
	}

	/**
	 * Get all slices.
	 *
	 * @return {Object}
	 */
	getAllSlices() {
		return this.slices;
	}

	/**
	 * Get All slices.
	 *
	 * @return {Object}
	 */
	getAll() {
		return Object.keys( this.slices ).sort();
	}

	/**
	 * Return the current reducers.
	 *
	 * @return {Object}
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
	 * Select and subscribe to a specific part of the store.
	 *
	 * @see https://github.com/reduxjs/redux/issues/303#issuecomment-125184409
	 * @param select
	 * @param onChange
	 * @returns {*}
	 */
	selector( select, onChange ) {
		let currentState;

		const handleChange = () => {
			const nextState = select( this.getState() );

			if ( nextState !== currentState ) {
				onChange( nextState, currentState );
				currentState = nextState;
			}
		};

		const unsubscribe = this.subscribe( handleChange );

		handleChange();

		return unsubscribe;
	}

	/**
	 * Proxy to Redux's `getState()` function, with the ability to get a specific slice.
	 *
	 * @param {string|null} sliceId
	 *
	 * @return {*}
	 */
	getState( sliceId = null ) {
		const state = this.reduxStore.getState();

		return sliceId ? state[ sliceId ] : state;
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
