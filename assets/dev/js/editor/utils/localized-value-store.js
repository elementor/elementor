export default class LocalizedValueStore {
	constructor() {
		this.store = [];
	}

	/**
	 * Receives the incoming event and returns the stored localized value
	 * English values will be returned as is
	 * Paste will return an empty value
	 *
	 * @param event - the incoming event
	 * @return string
	 */

	appendAndParseLocalizedData( event ) {
		if ( this.isPaste( event ) ) {
			this.resetStore();
		} else if ( this.isInputValueShorterThanStoreLength( event ) ) {
			this.rebuildStore( event );
		} else if ( this.isLetter( event ) || this.isSpace( event ) ) {
			this.addCharToStore( event );
		}
		return this.store.map( ( x ) => x.localized ).join( '' );
	}

	resetStore() {
		this.store = [];
	}

	isPaste( event ) {
		const PASTE_EVENT = 'insertFromPaste';
		const KEY_V = 'KeyV';

		const originalEventPaste = PASTE_EVENT === event.originalEvent.inputType;
		const ctrlPlusV = event.code === KEY_V && event.ctrlKey;

		return ( originalEventPaste || ctrlPlusV );
	}

	isInputValueShorterThanStoreLength( event ) {
		return event.target.value?.length < this.store.length;
	}

	addCharToStore( event ) {
		let localizedValue = String.fromCharCode( event.keyCode );
		if ( ! this.localizationRequired( localizedValue, event ) ) {
			localizedValue = event.originalEvent.key;
		}

		this.store.push( { original: event.originalEvent.key, localized: localizedValue } );
	}

	localizationRequired( localizedValue, event ) {
		return localizedValue.toLowerCase() !== event.originalEvent.key.toLowerCase();
	}

	isSpace( event ) {
		return 32 === event.keyCode || ' ' === event.originalEvent.data;
	}

	isLetter( event ) {
		return event.keyCode >= 65 && event.keyCode <= 90;
	}

	rebuildStore( event ) {
		const chars = event.target.value.split( '' );

		this.store = chars.map( ( char ) => this.buildLocalizationElement( char ) );
	}

	buildLocalizationElement( char ) {
		return { original: char, localized: this.store.find( ( element ) => element.original === char ).localized };
	}
}
