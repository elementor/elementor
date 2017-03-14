var HotKeys = function( $ ) {
	var self = this,
		hotKeysHandlers = {};

	var keysDictionary = {
		del: 46,
		d: 68,
		l: 76,
		m: 77,
		p: 80,
		s: 83
	};

	var isMac = function() {
		return -1 !== navigator.userAgent.indexOf( 'Mac OS X' );
	};

	var initHotKeysHandlers = function() {

		hotKeysHandlers[ keysDictionary.del ] = {
			deleteElement: {
				isWorthHandling: function( event ) {
					var isEditorOpen = 'editor' === elementor.getPanelView().getCurrentPageName(),
						isInputTarget = $( event.target ).is( ':input' );

					return isEditorOpen && ! isInputTarget;
				},
				handle: function() {
					elementor.getPanelView().getCurrentPageView().getOption( 'editedElementView' ).confirmRemove();
				}
			}
		};

		hotKeysHandlers[ keysDictionary.d ] = {
			/* Waiting for CTRL+Z / CTRL+Y
			duplicateElement: {
				isWorthHandling: function( event ) {
					return self.isControlEvent( event );
				},
				handle: function() {
					var panel = elementor.getPanelView();

					if ( 'editor' !== panel.getCurrentPageName() ) {
						return;
					}

					panel.getCurrentPageView().getOption( 'editedElementView' ).duplicate();
				}
			}*/
		};

		hotKeysHandlers[ keysDictionary.l ] = {
			showTemplateLibrary: {
				isWorthHandling: function( event ) {
					return self.isControlEvent( event ) && event.shiftKey;
				},
				handle: function() {
					elementor.templates.showTemplatesModal();
				}
			}
		};

		hotKeysHandlers[ keysDictionary.m ] = {
			changeDeviceMode: {
				devices: [ 'desktop', 'tablet', 'mobile' ],
				isWorthHandling: function( event ) {
					return self.isControlEvent( event ) && event.shiftKey;
				},
				handle: function() {
					var currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
						modeIndex = this.devices.indexOf( currentDeviceMode );

					modeIndex++;

					if ( modeIndex >= this.devices.length ) {
						modeIndex = 0;
					}

					elementor.changeDeviceMode( this.devices[ modeIndex ] );
				}
			}
		};

		hotKeysHandlers[ keysDictionary.p ] = {
			changeEditMode: {
				isWorthHandling: function( event ) {
					return self.isControlEvent( event );
				},
				handle: function() {
					elementor.getPanelView().modeSwitcher.currentView.toggleMode();
				}
			}
		};

		hotKeysHandlers[ keysDictionary.s ] = {
			saveEditor: {
				isWorthHandling: function( event ) {
					return self.isControlEvent( event );
				},
				handle: function() {
					elementor.getPanelView().getFooterView()._publishBuilder();
				}
			}
		};
	};

	var applyHotKey = function( event ) {
		var handlers = hotKeysHandlers[ event.which ];

		if ( ! handlers ) {
			return;
		}

		_.each( handlers, function( handler ) {
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
	};

	var bindEvents = function() {
		self.bindListener( elementor.$window );
	};

	this.isControlEvent = function( event ) {
		return event[ isMac() ? 'metaKey' : 'ctrlKey' ];
	};

	this.addHotKeyHandler = function( keyCode, handlerName, handler ) {
		if ( ! hotKeysHandlers[ keyCode ] ) {
			hotKeysHandlers[ keyCode ] = {};
		}

		hotKeysHandlers[ keyCode ][ handlerName ] = handler;
	};

	this.bindListener = function( $listener ) {
		$listener.on( 'keydown', applyHotKey );
	};

	this.init = function() {
		initHotKeysHandlers();

		bindEvents();
	};
};

module.exports = new HotKeys( jQuery );
