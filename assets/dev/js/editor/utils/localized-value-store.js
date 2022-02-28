export default class LocalizedValueStore {
	constructor() {
		this.store = [];
	}

	sendKey( event ) {
		const isLetter = event.keyCode >= 65 && event.keyCode <= 90;
		const isSpace = 32 === event.keyCode || ' ' === event.originalEvent.data;

		if ( isLetter || isSpace ) {
			this.store.push( { original: event.originalEvent.key, localized: String.fromCharCode( event.keyCode ) } );
		}
		if ( event.currentTarget.value?.length < this.store.length ) {
			this.store = this.rebuildStore( event.target.value );
		}
	}

	shouldBeIgnored( event ) {
		return event.shiftKey || event.ctrlKey || event.altKey;
	}

	get() {
		return this.store.map( ( x ) => x.english ).join( '' );
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
