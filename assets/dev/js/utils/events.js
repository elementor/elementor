export class Events {
	/**
	 * Dispatch an Elementor event.
	 *
	 * Will dispatch both native event & jQuery event (as BC).
	 * By default, `bcEvent` is `null`.
	 *
	 * @param {Object} context - The context that will dispatch the event.
	 * @param {string} event - Event to dispatch.
	 * @param {string|null} bcEvent - BC event to dispatch, default to `null`.
	 *
	 * @return {void}
	 */
	static dispatch( context, event, bcEvent = null ) {
		// Get the jQuery & native scopes.
		const isJq = ( context instanceof jQuery ),
			nativeScope = isJq ? context[ 0 ] : context,
			jqScope = isJq ? context : jQuery( context );

		// Dispatch the BC event only if exists.
		if ( bcEvent ) {
			jqScope.trigger( bcEvent );
		}

		nativeScope.dispatchEvent( new Event( event ) );
	}
}

export default Events;
