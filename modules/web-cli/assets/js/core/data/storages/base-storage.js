/**
 * TODO: Merge all storage's to one.
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
		const result = this.provider.getItem( key );

		if ( null !== result ) {
			return JSON.parse( result );
		}

		return result;
	}

	key( index ) {
		return this.provider.key( index );
	}

	removeItem( key ) {
		return this.provider.removeItem( key );
	}

	setItem( key, value ) {
		return this.provider.setItem( key, JSON.stringify( value ) );
	}

	getAll() {
		const keys = Object.keys( this.provider ),
			result = {};

		keys.forEach( ( key ) => {
			result[ key ] = this.getItem( key );
		} );

		return result;
	}
}
