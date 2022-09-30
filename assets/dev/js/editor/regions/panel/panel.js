var BaseRegion = require( 'elementor-regions/base' );

module.exports = BaseRegion.extend( {
	el: '#elementor-panel',

	getStorageKey() {
		return 'panel';
	},

	getDefaultStorage() {
		return {
			size: {
				width: '',
			},
		};
	},

	constructor() {
		BaseRegion.prototype.constructor.apply( this, arguments );

		var PanelLayoutView = require( 'elementor-regions/panel/layout' );

		this.show( new PanelLayoutView() );

		this.resizable();

		this.setSize();

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched );
	},

	setSize() {
		const savedWidth = this.storage.size.width;

		elementorCommon.elements.$body.css( '--e-editor-panel-width', savedWidth );
	},

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

	onEditModeSwitched( activeMode ) {
		if ( 'edit' !== activeMode ) {
			return;
		}

		this.setSize();
	},
} );
