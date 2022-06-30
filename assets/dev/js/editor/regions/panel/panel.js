var BaseRegion = require( 'elementor-regions/base' );

module.exports = BaseRegion.extend( {
	el: '#elementor-panel',

	getStorageKey() {
		return 'panel';
	},

	// getDefaultStorage() {
	// 	return {
	// 		size: {
	// 			width: '',
	// 		},
	// 	};
	// },

	constructor() {
		BaseRegion.prototype.constructor.apply( this, arguments );

		var PanelLayoutView = require( 'elementor-regions/panel/layout' );

		this.show( new PanelLayoutView() );

		// this.isDocked = false;

		// this.resizable();

		// this.setSize();

		// elementor.changeEditMode( 'edit' );
	},

	// setSize() {
	// 	const savedWidth = this.storage.size.width;

	// 	elementorCommon.elements.$body.css( '--e-editor-panel-width', savedWidth );
	// },

	resizable() {
		var self = this;

		self.$el.resizable( {
			handles: elementorCommon.config.isRTL ? 'w' : 'e',
			minWidth: 200,
			maxWidth: 680,
			start() {
				elementor.$previewWrapper.addClass( 'ui-resizable-resizing' );
			},
			stop( event, ui ) {
				elementor.$previewWrapper.removeClass( 'ui-resizable-resizing' );

				elementor.getPanelView().updateScrollbar();

				self.saveSize( { width: ui.size.width + 'px' } );
			},
			resize( event, ui ) {
				elementorCommon.elements.$body.css( '--e-editor-panel-width', ui.size.width + 'px' );

				self.$el.css( {
					width: '',
					// For RTL
					left: '',
				} );
			},
		} );
	},

	getDockingSide: function() {
		return elementorCommon.config.isRTL ? 'right' : 'left';
	},

	isPushingContent() {
		return false;
	},

	canResize() {
		return false;
	},

	canFloat() {
		return false;
	},

	open() {
		BaseRegion.prototype.open.apply( this, arguments );
		this.dock( this.getDockingSide() );
	},

	// initBehavior: function() {
	// 	console.log( 'initBehavior' ); //Here
	// },
} );
