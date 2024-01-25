class EventsStorage {
	key = 'e_editor-events';

	set( event ) {
		const existingEvents = this.get();
		existingEvents.push( event );

		localStorage.setItem( this.key, JSON.stringify( existingEvents ) );
	}

	get() {
		const storageItem = localStorage.getItem( this.key );

		if ( ! storageItem ) {
			return [];
		}

		return JSON.parse( storageItem );
	}

	clear() {
		localStorage.removeItem( this.key );
	}
}

export default new EventsStorage();
