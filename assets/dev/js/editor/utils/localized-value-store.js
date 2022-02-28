export default class LocalizedValueStore {
	constructor() {
		this.store = [];
	}

	/**
	 * Receives the incoming event and builds the localized store
	 * @param event
	 */
	sendKey( event ) {
		if ( this.isLetter( event ) || this.isSpace( event ) ) {
			this.addCharToStore( event );
		} else if ( this.isInputValueShorterThanStoreLength( event ) ) {
			this.store = this.rebuildStore( event.target.value );
		}
	}

	/**
	 * Return the localized value from the store
	 * @returns {string}
	 */
	get() {
		return this.store.map( ( x ) => x.localized ).join( '' );
	}

	isInputValueShorterThanStoreLength( event ) {
		return event.target.value?.length < this.store.length;
	}

	addCharToStore( event ) {
		this.store.push( { original: event.originalEvent.key, localized: String.fromCharCode( event.keyCode ) } );
	}

	isSpace( event ) {
		return 32 === event.keyCode || ' ' === event.originalEvent.data;
	}

	isLetter( event ) {
		return event.keyCode >= 65 && event.keyCode <= 90;
	}

	rebuildStore( value ) {
		const chars = value.split( '' );
		const newStore = [];
		let charsIndex = 0;
		for ( let storeIndex = 0; storeIndex < this.store.length; storeIndex++ ) {
			if ( this.store[ storeIndex ].original === chars[ charsIndex ] ) {
				newStore.push( this.store[ storeIndex ] );
				charsIndex++;
			}
		}

		return newStore;
	}
}
