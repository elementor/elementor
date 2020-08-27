import { configureStore, createSlice as createSliceBase } from '@reduxjs/toolkit';

export {
	Provider,
	useDispatch,
	useSelector,
} from 'react-redux';

export function createSlice( { controllers, selectors, ...options } ) {
	const baseSlice = createSliceBase( options );

	return {
		...baseSlice,
		selectors,
		controllers,
	};
}

export class StoreManager {
	/**
	 * Holds all the slices of the app.
	 *
	 * @type {*[]}
	 */
	slices = [];

	/**
	 * Add slice of state to the store
	 *
	 * @param key
	 * @param slice
	 * @returns {StoreManager}
	 */
	addSlice( key, slice ) {
		if ( this.getSlice( key, false ) ) {
			// TODO: Warn that slice is already exists
		}

		this.slices.push( {
			key,
			slice,
		} );

		return this;
	}

	/**
	 * Add object of slices
	 *
	 * @param slices
	 * @returns {StoreManager}
	 */
	addSlices( slices ) {
		Object.keys( slices ).forEach( ( key ) => {
			this.addSlice( key, slices[ key ] );
		} );

		return this;
	}

	/**
	 * Get specific slice.
	 *
	 * @param key
	 * @param shouldWarn
	 * @returns {null|*}
	 */
	getSlice( key, shouldWarn = true ) {
		const slice = this.slices.find( ( s ) => s.key === key );

		if ( ! slice ) {
			if ( shouldWarn ) {
				// TODO: Warn that slice is not exists
			}

			return null;
		}

		return slice.slice;
	}

	/**
	 * Return all the slices
	 *
	 * @returns {*[]}
	 */
	getSlices() {
		return this.slices;
	}

	/**
	 * Return only the slices reducers.
	 *
	 * @returns {{}}
	 */
	getSlicesReducers() {
		return this.getSlices().reduce( ( current, { key, slice } ) => {
			return { ...current, [ key ]: slice.reducer };
		}, {} );
	}

	/**
	 * Generate store from all the slices.
	 *
	 * @returns {EnhancedStore<{}, AnyAction, [ThunkMiddlewareFor<{}>]>}
	 */
	createStore() {
		const store = configureStore( {
			reducer: this.getSlicesReducers(),
		} );

		this.slices = this.getSlices().map( ( { key, slice } ) => {
			return {
				key,
				slice: {
					...slice,
					controllers: Object.keys( slice.controllers )
						.reduce( ( current, controllerKey ) => {
							return {
								...current,
								[ controllerKey ]: ( payload ) => slice.controllers[ controllerKey ]( {
									dispatch: store.dispatch,
									actions: slice.actions,
								}, payload ),
							};
						}, {} ),
				},
			};
		} );

		return store;
	}
}

export const manager = new StoreManager();

export function useSlice( sliceKey ) {
	return React.useMemo( () => manager.getSlice( sliceKey ), [ sliceKey ] );
}

/**
 * An hook to create shortcut for consume slice actions.
 *
 * @param sliceKey
 * @returns {{}}
 */
export function useSliceActions( sliceKey ) {
	return useSlice( sliceKey ).actions;
}

export function useSliceControllers( sliceKey ) {
	return useSlice( sliceKey ).controllers;
}
