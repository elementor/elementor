class BaseTracking {
	static observers = [];
	static eventListeners = [];

	static destroy() {
		this.observers.forEach( ( observer ) => observer.disconnect() );
		this.observers = [];

		this.eventListeners.forEach( ( { target, type, handler, options } ) => {
			target.removeEventListener( type, handler, options );
		} );
		this.eventListeners = [];
	}

	static addObserver( target, options, callback ) {
		const observer = new MutationObserver( callback );
		observer.observe( target, options );
		this.observers.push( observer );
		return observer;
	}

	static addEventListenerTracked( target, type, handler, options = {} ) {
		target.addEventListener( type, handler, options );
		this.eventListeners.push( { target, type, handler, options } );
	}
}

export default BaseTracking;

