export default class extends elementorModules.Module {
	get( key ) {
		let elementorStorage = localStorage.getItem( 'elementor' );

		if ( elementorStorage ) {
			elementorStorage = JSON.parse( elementorStorage );
		} else {
			elementorStorage = {};
		}

		if ( ! elementorStorage.__expiration ) {
			elementorStorage.__expiration = {};
		}

		const expiration = elementorStorage.__expiration;

		let expirationToCheck = [];

		if ( key ) {
			if ( expiration[ key ] ) {
				expirationToCheck = [ key ];
			}
		} else {
			expirationToCheck = Object.keys( expiration );
		}

		let entryExpired = false;

		expirationToCheck.forEach( ( expirationKey ) => {
			if ( new Date( expiration[ expirationKey ] ) < new Date() ) {
				delete elementorStorage[ expirationKey ];

				delete expiration[ expirationKey ];

				entryExpired = true;
			}
		} );

		if ( entryExpired ) {
			this.save( elementorStorage );
		}

		if ( key ) {
			return elementorStorage[ key ];
		}

		return elementorStorage;
	}

	set( key, value, lifeTimeInSeconds ) {
		const elementorStorage = this.get();

		elementorStorage[ key ] = value;

		if ( lifeTimeInSeconds ) {
			const date = new Date();

			date.setTime( date.getTime() + ( lifeTimeInSeconds * 1000 ) );

			elementorStorage.__expiration[ key ] = date.getTime();
		}

		this.save( elementorStorage );
	}

	save( object ) {
		localStorage.setItem( 'elementor', JSON.stringify( object ) );
	}
}
