import { configureStore } from '@reduxjs/toolkit';

export { createSlice } from '@reduxjs/toolkit';

export {
	Provider,
	useDispatch,
	useSelector,
} from 'react-redux';

export class StoreManager {
	/**
	 * Holds all the slices of the app.
	 *
	 * @type {{}}
	 */
	slices = {};

	/**
	 * Add slice of state to the store
	 *
	 * @param key
	 * @param slice
	 * @returns {StoreManager}
	 */
	addSlice( key, slice ) {
		if ( this.slices.hasOwnProperty( key ) ) {
			// TODO: Warn that slice is already exists
		}

		this.slices[ key ] = {
			key,
			slice,
		};

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
	 * @returns {*}
	 */
	getSlice( key ) {
		if ( ! this.slices.hasOwnProperty( key ) ) {
			// TODO: Warn that slice is not exists

			return null;
		}

		return this.slices[ key ].slice;
	}

	/**
	 * Return all the slices
	 *
	 * @returns {{}}
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
		return Object.values( this.getSlices() ).reduce( ( current, { key, slice } ) => {
			return { ...current, [ key ]: slice.reducer };
		}, {} );
	}

	/**
	 * Generate store from all the slices.
	 *
	 * @returns {EnhancedStore<{}, AnyAction, [ThunkMiddlewareFor<{}>]>}
	 */
	createStore() {
		return configureStore( {
			reducer: this.getSlicesReducers(),
		} );
	}
}

export const manager = new StoreManager();

/**
 * An hook to create shortcut for consume slice actions.
 *
 * @param sliceKey
 * @returns {{}}
 */
export function useSliceActions( sliceKey ) {
	const slice = React.useMemo( () => manager.getSlice( sliceKey ), [ sliceKey ] );

	if ( ! slice ) {
		return {};
	}

	return slice.actions;
}
