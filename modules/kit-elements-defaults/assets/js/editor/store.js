/**
 * Store for kit elements defaults.
 */
export default {
	items: {},

	/**
	 * Get element default settings by elType / widgetType.
	 *
	 * @param {string} type
	 *
	 * @return {Object}
	 */
	get( type ) {
		return this.items[ type ] || {};
	},

	/**
	 * Load all elements defaults from server into the local cache.
	 *
	 * @return {Promise<void>}
	 */
	async load() {
		this.items = await $e.api.get( '/kit-elements-defaults' );
	},

	/**
	 * Insert element default settings to the store.
	 *
	 * @param {string} type
	 * @param {Object} settings
	 *
	 * @return {Promise<void>}
	 */
	async upsert( type, settings ) {
		await $e.api.put( `/kit-elements-defaults/${ type }`, { settings } );

		await this.load();
	},

	/**
	 * Delete element default settings from the store.
	 *
	 * @param {string} type
	 *
	 * @return {Promise<void>}
	 */
	async delete( type ) {
		await $e.api.delete( `/kit-elements-defaults/${ type }` );

		await this.load();
	},
};
