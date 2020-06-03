const Store = class {
	static getKey( library ) {
		const name = ( library.name ) ? library.name : library;
		return `elementor_${ name }_icons`;
	}

	save( library ) {
		elementorCommon.storage.set( Store.getKey( library ), library );
	}

	getIcons( library ) {
		const data = this.get( Store.getKey( library ) );
		if ( data && data.icons ) {
			return data.icons;
		}
		return false;
	}

	get( key ) {
		return elementorCommon.storage.get( key );
	}

	isValid( library ) {
		const saved = this.get( Store.getKey( library ) );
		if ( ! saved ) {
			return false;
		}
		if ( saved.ver !== library.ver ) {
			// @todo: delete from localStorage if version is invalid
			return false;
		}
		return ( saved.icons && saved.icons.length );
	}
};

export default Store;
