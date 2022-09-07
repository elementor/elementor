import environment from 'elementor-api/utils/environment';
import Console from 'elementor-api/utils/console';

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

	getAll() {
		const shortcuts = {};
		jQuery.each( this.handlers, ( key, handler ) => {
			jQuery.each( handler, ( index, config ) => {
				shortcuts[ config.command ] = key;
			} );
		} );

		return shortcuts;
	}

	/**
	 * @param {string}   shortcuts
	 * @param {Object}   args
	 * @param {Function} args.callback    Required
	 * @param {string}   args.component   Optional
	 * @param {Function} args.dependency  Optional
	 * @param {Array}    args.exclude     Optional
	 * @param {boolean}  args.allowAltKey Optional
	 */
	register( shortcuts, args ) {
		shortcuts.replace( ' ', '' ).split( ',' ).forEach( ( shortcut ) => {
			if ( ! this.handlers[ shortcut ] ) {
				this.handlers[ shortcut ] = [];
			}

			this.handlers[ shortcut ].push( args );
		} );
	}

	unregister( shortcuts, args ) {
		shortcuts.replace( ' ', '' ).split( ',' ).forEach( ( shortcut ) => {
			this.handlers[ shortcut ].forEach( ( index, handler ) => {
				if ( args === handler ) {
					delete this.handlers[ shortcut ][ index ];
				}
			} );
		} );
	}

	handle( event ) {
		const handlers = this.getHandlersByPriority( event );

		if ( ! handlers ) {
			return;
		}

		const filteredHandlers = handlers.filter( ( handler ) => {
			if ( handler.exclude && -1 !== handler.exclude.indexOf( 'input' ) ) {
				const $target = jQuery( event.target );

				if ( $target.is( ':input, .elementor-input' ) || $target.closest( '[contenteditable="true"]' ).length ) {
					return false;
				}
			}

			if ( handler.dependency && ! handler.dependency( event ) ) {
				return false;
			}

			// Fix for some keyboard sources that consider alt key as ctrl key
			if ( ! handler.allowAltKey && event.altKey ) {
				return false;
			}

			return true;
		} );

		if ( ! filteredHandlers.length ) {
			return;
		}

		if ( 1 < filteredHandlers.length && elementorWebCliConfig.isDebug ) {
			Console.warn( 'Multiple handlers for shortcut.', filteredHandlers, event );
		}

		event.preventDefault();

		filteredHandlers[ 0 ].callback( event );
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

	isActiveScope( scopes ) {
		const activeComponents = Object.keys( $e.components.activeComponents ),
			activeComponent = activeComponents[ activeComponents.length - 1 ],
			component = $e.components.get( activeComponent );

		if ( ! component ) {
			return false;
		}

		const namespace = component.getNamespace();

		const filteredByNamespace = scopes.some( ( scope ) => namespace === scope );

		if ( filteredByNamespace ) {
			return true;
		}

		// Else filter by namespaceRoot.
		const namespaceRoot = component.getServiceName();
		return scopes.some( ( scope ) => namespaceRoot === scope );
	}

	getHandlersByPriority( event ) {
		const handlers = this.handlers[ this.getEventShortcut( event ) ];

		if ( ! handlers ) {
			return false;
		}

		// TODO: Prioritize current scope before roo scope.
		const inCurrentScope = handlers.filter( ( handler ) => {
			return handler.scopes && this.isActiveScope( handler.scopes );
		} );

		if ( inCurrentScope.length ) {
			return inCurrentScope;
		}

		const noScope = handlers.filter( ( handler ) => {
			return ! handler.scopes;
		} );

		if ( noScope.length ) {
			return noScope;
		}
	}
}
