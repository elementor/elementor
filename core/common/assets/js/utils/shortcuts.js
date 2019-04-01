import environment from './environment';

export default class Shortcuts {
	constructor( $window ) {
		this.specialKeys = {
			13: 'enter',
			27: 'esc',
			38: 'up',
			40: 'down',
			46: 'del',
			191: '?',
		};

		this.component = '';
		this.handlers = {};

		this.bindListener( $window );
	}

	bindListener( $window ) {
		$window.on( 'keydown', ( event ) => this.handle( event ) );
	}

	register( shortcuts, args ) {
		shortcuts.replace( ' ', '' ).split( ',' ).forEach( ( shortcut ) => {
			if ( ! this.handlers[ shortcut ] ) {
				this.handlers[ shortcut ] = [];
			}

			this.handlers[ shortcut ].push( args );
		} );
	}

	handle( event ) {
		const handlers = this.handlers[ this.getEventShortcut( event ) ];

		if ( ! handlers ) {
			return;
		}

		jQuery.each( handlers, ( key, handler ) => {
			if ( handler.component && handler.component !== this.component ) {
				return;
			}

			if ( handler.dependency && ! handler.dependency( event ) ) {
				return;
			}

			// Fix for some keyboard sources that consider alt key as ctrl key
			if ( ! handler.allowAltKey && event.altKey ) {
				return;
			}

			event.preventDefault();

			handler.callback( event );
		} );
	}

	setComponent( component ) {
		this.component = component;
	}

	isControlEvent( event ) {
		return event[ environment.mac ? 'metaKey' : 'ctrlKey' ];
	}

	getEventShortcut( event ) {
		const shortcut = [];

		if ( event.altKey ) {
			shortcut.push( 'alt' );
		}

		if ( this.isControlEvent( event ) ) {
			shortcut.push( 'ctrl' );
		}

		if ( event.shiftKey ) {
			shortcut.push( 'shift' );
		}

		if ( this.specialKeys[ event.which ] ) {
			shortcut.push( this.specialKeys[ event.which ] );
		} else {
			shortcut.push( String.fromCharCode( event.which ).toLowerCase() );
		}

		return shortcut.join( '+' );
	}
}
