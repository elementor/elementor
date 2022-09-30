import BaseStorage from 'elementor-api/core/data/storages/base-storage';

export default class BasePrefixStorage extends BaseStorage {
	static DEFAULT_KEY_PREFIX = 'e_';

	clear() {
		Object.keys( this.getAll() ).forEach( ( key ) => this.removeItem( key ) );
	}

	getItem( key ) {
		return super.getItem( BasePrefixStorage.DEFAULT_KEY_PREFIX + key );
	}

	removeItem( key ) {
		return super.removeItem( BasePrefixStorage.DEFAULT_KEY_PREFIX + key );
	}

	setItem( key, value ) {
		return super.setItem( BasePrefixStorage.DEFAULT_KEY_PREFIX + key, value );
	}

	getAll() {
		const { DEFAULT_KEY_PREFIX } = BasePrefixStorage,
			keys = Object.keys( this.provider ),
			result = {};

		keys.forEach( ( key ) => {
			if ( key.startsWith( DEFAULT_KEY_PREFIX ) ) {
				key = key.replace( DEFAULT_KEY_PREFIX, '' );
				result[ key ] = this.getItem( key );
			}
		} );

		return result;
	}
}
