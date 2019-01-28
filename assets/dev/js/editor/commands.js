const Commands = function() {
	const self = this,
		commands = {},
		dependencies = {},
		shortcuts = {};

	self.register = function( cat, id, callback, shortcut ) {
		const unique = cat + '.' + id;

		if ( commands[ unique ] ) {
			throw Error( 'Command `' + id + '` is already registered in category `' + cat + '`' );
		}

		commands[ unique ] = callback;

		if ( shortcut ) {
			if ( shortcuts[ shortcut ] ) {
				throw Error( 'Shortcut `' + shortcut + '` is already taken by `' + unique + '`' );
			}

			shortcuts[ shortcut ] = unique;
		}
	};

	self.registerDependency = function( cat, callback ) {
		dependencies[ cat ] = callback;
	};

	self.run = function( cat, id, args ) {
		const unique = cat + '.' + id;
		if ( ! commands[ unique ] ) {
			throw Error( 'Command `' + id + '` not found in category `' + cat + '`' );
		}

		if ( dependencies[ cat ] && ! dependencies[ cat ].apply() ) {
			return;
		}

		commands[ unique ].apply( this, args );
	};

	const init = function() {
		// self.register( 'dnd', 'move', function( element, from, to ) {
		//
		// } );

		self.registerDependency( 'elements', function() {
			const panel = elementor.getPanelView();

			return 'editor' === panel.getCurrentPageName();
		} );

		self.register( 'elements', 'copy', function() {
			elementor.getPanelView().getCurrentPageView().getOption( 'editedElementView' ).copy();
		}, 'c+c' );

		self.register( 'elements', 'duplicate', function() {
			elementor.getPanelView().getCurrentPageView().getOption( 'editedElementView' ).duplicate();
		}, 'c+d' );

		self.register( 'elements', 'delete', function() {
			var $target = $( event.target );

			if ( $target.is( ':input, .elementor-input' ) ) {
				return;
			}

			if ( $target.closest( '[contenteditable="true"]' ).length ) {
				return;
			}

			elementor.getPanelView().getCurrentPageView().getOption( 'editedElementView' ).removeElement();
		}, 'c+del' );

		const getCurrentElement = function() {
			const isPreview = ( -1 !== [ 'BODY', 'IFRAME' ].indexOf( document.activeElement.tagName ) && 'BODY' === elementorFrontend.elements.window.document.activeElement.tagName );

			if ( ! isPreview ) {
				return false;
			}

			let targetElement = elementor.channels.editor.request( 'contextMenu:targetView' );

			if ( ! targetElement ) {
				const panel = elementor.getPanelView();

				if ( 'editor' === panel.getCurrentPageName() ) {
					targetElement = panel.getCurrentPageView().getOption( 'editedElementView' );
				}
			}

			if ( ! targetElement ) {
				targetElement = elementor.getPreviewView();
			}

			return targetElement;
		};

		self.register( 'elements', 'paste', function() {
			const targetElement = getCurrentElement();

			if ( ! targetElement ) {
				return;
			}

			if ( targetElement.isPasteEnabled() ) {
				targetElement.paste();
			}
		}, 'c+v' );

		self.register( 'elements', 'pasteStyle', function() {
			const targetElement = getCurrentElement();

			if ( ! targetElement ) {
				return;
			}

			if ( targetElement.pasteStyle && elementorCommon.storage.get( 'transfer' ) ) {
				targetElement.pasteStyle();
			}
		}, 'c+s+v' );

		self.registerDependency( 'navigator', function() {
			return 'edit' === elementor.channels.dataEditMode.request( 'activeMode' );
		} );

		self.register( 'navigator', 'toggle', function() {
			if ( elementor.navigator.storage.visible ) {
				elementor.navigator.close();
			} else {
				elementor.navigator.open();
			}
		}, 'c+i' );

		self.register( 'library', 'show', function() {
			elementor.templates.startModal();
		}, 'c+s+i' );

		self.register( 'preview', 'toggleResponsive', function() {
			var currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
				modeIndex = this.devices.indexOf( currentDeviceMode );

			modeIndex++;

			if ( modeIndex >= this.devices.length ) {
				modeIndex = 0;
			}
			//
			elementor.changeDeviceMode( this.devices[ modeIndex ] );
		}, 'c+s+m' );

		self.register( 'document', 'save', function() {
			elementor.saver.saveDraft();
		}, 'c+s' );

		self.register( 'panel', 'exit', function() {
			if ( ! jQuery( '.dialog-widget:visible' ).length ) {
				return;
			}
			elementor.getPanelView().setPage( 'menu' );
		}, 'esc' );
	};

	init();
};

module.exports = new Commands();
