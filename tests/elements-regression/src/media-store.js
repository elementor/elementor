const key = 'ELEMENTS_REGRESSION_MEDIA_IDS';

/**
 * Get media elements store.
 *
 * @return {Object}
 */
function getStore() {
	if ( ! process.env[ key ] ) {
		process.env[ key ] = JSON.stringify( {} );
	}

	return JSON.parse( process.env[ key ] );
}

/**
 * Update the media elements store.
 *
 * @param {Object} data
 */
function updateStore( data ) {
	process.env[ key ] = JSON.stringify( data );
}

module.exports = {
	/**
	 * Get media element ID from a given name.
	 *
	 * @param {string} imageName
	 * @return {string|number|null}
	 */
	getIdFromName( imageName ) {
		const store = getStore();

		return store[ imageName ] || null;
	},

	/**
	 * Get media name from a given ID.
	 *
	 * @param {string|number} id
	 * @return {string|null}
	 */
	getNameFromId( id ) {
		const store = getStore();

		const name = Object.keys( store )
			.find( ( imageName ) => store[ imageName ] === id );

		return name || null;
	},

	/**
	 * Add media element to the store.
	 *
	 * @param {string}        name
	 * @param {string|number} id
	 */
	set( name, id ) {
		const mediaIds = getStore();

		mediaIds[ name ] = id;

		updateStore( mediaIds );
	},
};
