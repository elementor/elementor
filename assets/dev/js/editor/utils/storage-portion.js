export default class StoragePortion {
	/**
	 * The key for this portion.
	 */
	key;

	/**
	 * The initial/default value for this portion.
	 */
	initial;

	/**
	 * Cache of the portion data.
	 */
	cache;

	/**
	 * The StoragePortion constructor.
	 *
	 * @param key
	 * @param initial
	 */
	constructor( key, initial = {} ) {
		this.key = key;

		this.initial = initial instanceof Function ?
			initial() :
			initial;

		this.reload();

		return new Proxy( this, {
			get: function( target, prop ) {
				if ( ! target[ prop ] ) {
					return target.get( prop );
				}

				return Reflect.get( ...arguments );
			},
		} );
	}

	/**
	 * Get all data from this portion, unless `key` is provided, in which case only the data from the specific key is
	 * returned.
	 *
	 * @param key
	 * @returns {*}
	 */
	get( key = null ) {
		if ( key ) {
			return this.cache[ key ];
		}

		return this.cache;
	}

	/**
	 * Set data within a specific key in this portion.
	 *
	 * @param key
	 * @param value
	 * @returns {*}
	 */
	set( key, value ) {
		this.cache[ key ] = value;

		elementorCommon.storage.set( this.key, this.cache );

		return this.cache;
	}

	/**
	 * Reload the data from storage into the cache.
	 */
	reload() {
		this.cache = elementorCommon.storage.get( this.key ) ||
			this.initial;
	}
}
