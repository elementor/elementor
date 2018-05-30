var ContextMenu = require( 'elementor-editor-utils/context-menu' );

module.exports = Marionette.Behavior.extend( {

	defaults: {
		groups: [],
		eventTargets: [ 'el' ]
	},

	events: function() {
		var events = {};

		this.getOption( 'eventTargets' ).forEach( function( eventTarget ) {
			var eventName = 'contextmenu';

			if ( 'el' !== eventTarget ) {
				eventName += ' ' + eventTarget;
			}

			events[ eventName ] = 'onContextMenu';
		} );

		return events;
	},

	initContextMenu: function() {
		var contextMenuGroups = this.getOption( 'groups' );

		this.contextMenu = new ContextMenu( {
			groups: contextMenuGroups
		} );
	},

	getContextMenu: function() {
		if ( ! this.contextMenu ) {
			this.initContextMenu();
		}

		return this.contextMenu;
	},

	onContextMenu: function( event ) {
		if ( elementor.hotKeys.isControlEvent( event ) ) {
			return;
		}

		var activeMode = elementor.channels.dataEditMode.request( 'activeMode' );

		if ( 'edit' !== activeMode ) {
			return;
		}

		event.preventDefault();

		this.getContextMenu().show( event );
	}
} );
