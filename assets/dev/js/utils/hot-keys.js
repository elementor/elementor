import environment from './environment';

export default class HotKeys {
	constructor() {
		this.hotKeysHandlers = {};
	}

	applyHotKey( event ) {
		const handlers = this.hotKeysHandlers[ event.which ];

		if ( ! handlers ) {
			return;
		}

		jQuery.each( handlers, ( key, handler ) => {
			if ( handler.isWorthHandling && ! handler.isWorthHandling( event ) ) {
				return;
			}

			// Fix for some keyboard sources that consider alt key as ctrl key
			if ( ! handler.allowAltKey && event.altKey ) {
				return;
			}

			event.preventDefault();

			handler.handle( event );
		} );
	}

	isControlEvent( event ) {
		return event[ environment.mac ? 'metaKey' : 'ctrlKey' ];
	}

	addHotKeyHandler( keyCode, handlerName, handler ) {
		if ( ! this.hotKeysHandlers[ keyCode ] ) {
			this.hotKeysHandlers[ keyCode ] = {};
		}

		this.hotKeysHandlers[ keyCode ][ handlerName ] = handler;
	}

	bindListener( $listener ) {
		$listener.on( 'keydown', this.applyHotKey.bind( this ) );
	}
}
