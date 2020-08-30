import { configureStore } from '@reduxjs/toolkit';

export default class StoreManager {
	/**
	 * Holds all the modules of the app.
	 *
	 * @type {*[]}
	 */
	modules = [];

	/**
	 * Holds the store manager instance
	 *
	 * @type {StoreManager}
	 */
	static instance;

	/**
	 * Get store manager instance.
	 *
	 * @returns {StoreManager}
	 */
	static getInstance() {
		if ( ! StoreManager.instance ) {
			StoreManager.instance = new StoreManager();
		}

		return StoreManager.instance;
	}

	/**
	 * Add module of state to the store
	 *
	 * @param module
	 * @returns {StoreManager}
	 */
	addModule( module ) {
		if ( this.getModule( module.name, false ) ) {
			// TODO: Warn that slice is already exists
		}

		this.modules.push( module );

		return this;
	}

	/**
	 * Add array of modules
	 *
	 * @param modules
	 * @returns {StoreManager}
	 */
	addModules( modules ) {
		modules.forEach( ( module ) => {
			this.addModule( module );
		} );

		return this;
	}

	/**
	 * Get specific module.
	 *
	 * @param name
	 * @param shouldWarn
	 * @returns {null|*}
	 */
	getModule( name, shouldWarn = true ) {
		const module = this.modules.find( ( s ) => s.name === name );

		if ( ! module ) {
			if ( shouldWarn ) {
				// TODO: Warn that slice is not exists
			}

			return null;
		}

		return module;
	}

	/**
	 * Return all the modules
	 *
	 * @returns {*[]}
	 */
	getModules() {
		return this.modules;
	}

	/**
	 * Return only the slices reducers.
	 *
	 * @returns {{}}
	 */
	getModulesReducers() {
		return this.getModules()
			.reduce( ( current, { name, slice } ) => {
				return { ...current, [ name ]: slice.reducer };
			}, {} );
	}

	/**
	 * Generate store from all the slices.
	 *
	 * @returns {EnhancedStore<{}, AnyAction, [ThunkMiddlewareFor<{}>]>}
	 */
	createStore() {
		return configureStore( {
			reducer: this.getModulesReducers(),
		} );
	}
}
