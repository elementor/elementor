export default class extends elementorModules.Module {
	get( key ) {
		let elementorStorage = localStorage.getItem( 'elementor' );

		if ( elementorStorage ) {
			elementorStorage = JSON.parse( elementorStorage );
		} else {
			elementorStorage = {};
		}

		if ( key ) {
			return elementorStorage[ key ];
		}

		return elementorStorage;
	}

	set( key, value ) {
		const elementorStorage = this.getStorage();

		elementorStorage[ key ] = value;

		localStorage.setItem( 'elementor', JSON.stringify( elementorStorage ) );
	}

	setCookie( key, value, secondsFromNow ) {
		document.cookie = `elementor_${ key }=${ value };max-age=${ secondsFromNow }`;
	}

	getCookie( key ) {
		const parts = `; ${ document.cookie }`.split( `; elementor_${ key }=` );

		if ( 2 === parts.length ) {
			return parts.pop().split( ';' ).shift();
		}
	}
}
