import BaseStorage from 'elementor-api/core/data/stroages/base-storage';

export default class PrefixStorage extends BaseStorage {
	static DEFAULT_KEY_PREFIX = 'e_';

	clear() {
		Object.keys( this.getAll() ).forEach( ( key ) => this.removeItem( key ) );
	}

	getItem( key ) {
		return super.getItem( PrefixStorage.DEFAULT_KEY_PREFIX + key );
	}

	removeItem( key ) {
		return super.removeItem( PrefixStorage.DEFAULT_KEY_PREFIX + key );
	}

	setItem( key, value ) {
		return super.setItem( PrefixStorage.DEFAULT_KEY_PREFIX + key, value );
	}

	getAll() {
		const { DEFAULT_KEY_PREFIX } = PrefixStorage,
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
