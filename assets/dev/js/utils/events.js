export class Events {
	/**
	 * Dispatch an Elementor event.
	 *
	 * Will dispatch both native event & jQuery event (as BC).
	 * By default, `bcEvent` is `null`.
	 *
	 * @param {Object} context - The context that will dispatch the event.
	 * @param {string} event - Event to dispatch.
	 * @param {*} data - Data to pass to the event, default to `null`.
	 * @param {string|null} bcEvent - BC event to dispatch, default to `null`.
	 *
	 * @return {void}
	 */
	static dispatch( context, event, data = null, bcEvent = null ) {
		// Get the jQuery & native scopes.
		const isJq = ( context instanceof jQuery ),
			nativeScope = isJq ? context[ 0 ] : context,
			jqScope = isJq ? context : jQuery( context );

		// Dispatch the BC event only if exists.
		if ( bcEvent ) {
			// jQuery `trigger` expects an array to be passed.
			if ( ! Array.isArray( data ) ) {
				data = [ data ];
			}

			jqScope.trigger( bcEvent, data );
		}

		nativeScope.dispatchEvent( new CustomEvent( event, { detail: data } ) );
	}
}

export default Events;
