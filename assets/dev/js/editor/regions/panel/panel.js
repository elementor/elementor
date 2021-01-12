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

		this.updateWidgetSize();
	},

	updateWidgetSize: function() {
		jQuery( '#elementor-panel' ).bind( 'load resize', () => {
			let getPanelWidth = document.getElementById( 'elementor-panel-elements-categories' ).clientWidth;
			let calcWidgetPanel = parseInt( ( getPanelWidth - 10 ) / 144 );
			let calcWidgetColumn = 1 === calcWidgetPanel ? ( 100 / 2 ) : ( 100 / calcWidgetPanel ).toFixed( 3 );
			jQuery( '.elementor-panel-category-items .elementor-element-wrapper' ).css( 'width', calcWidgetColumn + '%' );
		} );
	},

	setSize: function() {
		var width = this.storage.size.width,
			side = elementorCommon.config.isRTL ? 'right' : 'left';

		this.$el.css( 'width', width );

		elementor.$previewWrapper.css( side, width );
	},

	resizable: function() {
		var self = this,
			side = elementorCommon.config.isRTL ? 'right' : 'left';

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
				elementor.$previewWrapper.css( side, ui.size.width );
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
