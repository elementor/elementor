export class Events {
	/**
	 * Dispatch an Elementor event.
	 *
	 * Will dispatch both native event & jQuery event (as BC).
	 * By default, `bcEvent` is `null`.
	 *
	 * @param {Object}      context - The context that will dispatch the event.
	 * @param {string}      event   - Event to dispatch.
	 * @param {*}           data    - Data to pass to the event, default to `null`.
	 * @param {string|null} bcEvent - BC event to dispatch, default to `null`.
	 *
	 * @return {void}
	 */
	static dispatch( context, event, data = null, bcEvent = null ) {
		// Make sure to use the native context if it's a jQuery instance.
		context = ( context instanceof jQuery ) ? context[ 0 ] : context;

		// Dispatch the BC event only if exists.
		if ( bcEvent ) {
			context.dispatchEvent( new CustomEvent( bcEvent, { detail: data } ) );
		}

		// jQuery's `.on()` listens also to native custom events, so there is no need
		// to dispatch also a jQuery event.
		context.dispatchEvent( new CustomEvent( event, { detail: data } ) );
	}
}

export default Events;
