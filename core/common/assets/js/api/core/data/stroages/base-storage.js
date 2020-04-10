/**
 * Using this technique give's the ability to use JSDOC from 'window.storage'.
 *
 * @implements {Storage}
 */
export default class BaseStorage {
	/**
	 * Create storage wrapper.
	 *
	 * @param {Storage} provider
	 */
	constructor( provider ) {
		if ( BaseStorage === new.target ) {
			throw new TypeError( 'Cannot construct BaseStorage instances directly' );
		}

		this.provider = provider;
	}

	clear() {
		return this.provider.clear();
	}

	getItem( key ) {
		return this.provider.getItem( key );
	}

	key( index ) {
		return this.provider.key( index );
	}

	removeItem( key ) {
		return this.provider.removeItem( key );
	}

	setItem( key, value ) {
		return this.provider.setItem( key, value );
	}

	getAll() {
		const keys = Object.keys( this.provider ),
			result = {};

		keys.forEach( ( key ) => {
			result[ key ] = this.getItem( key );
		} );

		return result;
	}

	removeAll() {
		const keys = Object.keys( this.provider );

		keys.forEach( ( key ) => this.removeItem( key ) );
	}
}
