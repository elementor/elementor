var BaseRegion = require( 'elementor-regions/base' );

module.exports = BaseRegion.extend( {
	el: '#elementor-panel',

	getStorageKey: function() {
		return 'panel';
	},

	// getDefaultStorage: function() {
	// 	return {
	// 		size: {
	// 			width: '',
	// 		},
	// 	};
	// },

	constructor: function() {
		BaseRegion.prototype.constructor.apply( this, arguments );

		var PanelLayoutView = require( 'elementor-regions/panel/layout' );

		this.show( new PanelLayoutView() );

		// this.isDocked = false;

		this.resizable();

		// this.setSize();

		elementor.changeEditMode( '' );
		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched );

		// TODO: Move to hook on 'editor/documents/load'.
		elementor.on( 'document:loaded', this.onDocumentLoaded.bind( this ) );
	},

	// setSize: function() {
	// 	const savedWidth = this.storage.size.width;

	// 	elementorCommon.elements.$body.css( '--e-editor-panel-width', savedWidth );
	// },

	resizable: function() {
		var self = this;

		self.$el.resizable( {
			handles: elementorCommon.config.isRTL ? 'w' : 'e',
			minWidth: 200,
			maxWidth: 680,
			start: function() {
				elementor.$previewWrapper.addClass( 'ui-resizable-resizing' );
			},
			stop: function( event, ui ) {
				elementor.$previewWrapper.removeClass( 'ui-resizable-resizing' );

				elementor.getPanelView().updateScrollbar();

				self.saveSize( { width: ui.size.width + 'px' } );
			},
			resize: function( event, ui ) {
				elementorCommon.elements.$body.css( '--e-editor-panel-width', ui.size.width + 'px' );

				self.$el.css( {
					width: '',
					// For RTL
					left: '',
				} );
			},
		} );
	},

	onEditModeSwitched: function( activeMode ) {
		// if ( 'edit' !== activeMode ) {
		// 	return;
		// }

		// this.setSize();

		const visibleModes = [
			'edit',
			// 'picker',
		];

		if ( visibleModes.includes( activeMode ) /* && this.storage.visible */ ) {
			this.open();
		} else {
			this.close( true );
		}
	},

	open: function() {
		this.saveStorage( 'visible', true );
		this.$el.addClass( 'e-panel--open' );
	},

	close: function() {
		this.saveStorage( 'visible', false );
		this.$el.removeClass( 'e-panel--open' );
	},

	// initBehavior: function() {
	// 	console.log( 'initBehavior' ); //Here
	// },

	onDocumentLoaded: function( document ) {
		if ( document.config.panel.has_elements ) {
			this.initBehavior();

			// if ( this.storage.visible ) {
				// $e.route( 'navigator' );
				// this.open();
				// elementor.changeEditMode( 'edit' );
			// }
			// this.dock( 'left' );
		}
	},
} );
