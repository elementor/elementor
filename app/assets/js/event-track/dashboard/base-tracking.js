class BaseTracking {
	static ensureOwnArrays() {
		if ( ! Object.prototype.hasOwnProperty.call( this, 'observers' ) ) {
			this.observers = [];
		}

		if ( ! Object.prototype.hasOwnProperty.call( this, 'eventListeners' ) ) {
			this.eventListeners = [];
		}
	}

	static destroy() {
		this.ensureOwnArrays();

		this.observers.forEach( ( observer ) => observer.disconnect() );
		this.observers = [];

		this.eventListeners.forEach( ( { target, type, handler, options } ) => {
			target.removeEventListener( type, handler, options );
		} );
		this.eventListeners = [];
	}

	static addObserver( target, options, callback ) {
		this.ensureOwnArrays();

		const observer = new MutationObserver( callback );
		observer.observe( target, options );
		this.observers.push( observer );
		return observer;
	}

	static addEventListenerTracked( target, type, handler, options = {} ) {
		this.ensureOwnArrays();

		target.addEventListener( type, handler, options );
		this.eventListeners.push( { target, type, handler, options } );
	}
}

export default BaseTracking;

