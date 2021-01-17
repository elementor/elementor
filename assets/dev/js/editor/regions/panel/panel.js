var BaseRegion = require( 'elementor-regions/base' );

module.exports = BaseRegion.extend( {
	el: '#elementor-panel',

	getStorageKey: function() {
		return 'panel';
	},

	getDefaultStorage: function() {
		return {
			size: {
				width: '',
			},
		};
	},

	constructor: function() {
		BaseRegion.prototype.constructor.apply( this, arguments );

		var PanelLayoutView = require( 'elementor-regions/panel/layout' );

		this.show( new PanelLayoutView() );

		this.resizable();

		this.setSize();

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched );
	},

	setSize: function() {
		var width = this.storage.size.width,
			side = elementorCommon.config.isRTL ? 'right' : 'left';

		this.$el.css( 'width', width );

		elementor.$previewWrapper.css( side, width );
	},

	resizable: function() {
		var self = this;

		self.$el.resizable( {
			handles: elementorCommon.config.isRTL ? 'w' : 'e',
			minWidth: 200,
			maxWidth: 680,
			start: function() {
				elementor.$previewWrapper.addClass( 'ui-resizable-resizing' );
			},
			stop: function() {
				elementor.$previewWrapper.removeClass( 'ui-resizable-resizing' );

				elementor.getPanelView().updateScrollbar();

				self.saveSize();
			},
			resize: function( event, ui ) {
				document.body.style.setProperty( '--e-is-device-mode', ui.size.width );
			},
		} );
	},

	onEditModeSwitched: function( activeMode ) {
		if ( 'edit' !== activeMode ) {
			return;
		}

		this.setSize();
	},
} );
