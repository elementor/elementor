module.exports = Marionette.Region.extend( {
	el: '#elementor-panel',

	storage: {
		size: {
			width: ''
		}
	},

	constructor: function() {
		Marionette.Region.prototype.constructor.apply( this, arguments );

		var savedStorage = elementor.getStorage( 'panel' );

		if ( savedStorage ) {
			this.storage = savedStorage;
		}

		var PanelLayoutView = require( 'elementor-regions/panel/layout' );

		this.show( new PanelLayoutView() );

		this.resizable();

		this.setSize();

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched );
	},

	saveStorage: function( key, value ) {
		this.storage[ key ] = value;

		elementor.setStorage( 'panel', this.storage );
	},

	saveSize: function() {
		this.saveStorage( 'size', elementor.helpers.getElementInlineStyle( this.$el, [ 'width' ] ) );
	},

	setSize: function() {
		var width = this.storage.size.width,
			side = elementor.config.is_rtl ? 'right' : 'left';

		this.$el.css( 'width', width );

		elementor.$previewWrapper.css( side, width );
	},

	resizable: function() {
		var self = this,
			side = elementor.config.is_rtl ? 'right' : 'left';

		self.$el.resizable( {
			handles: elementor.config.is_rtl ? 'w' : 'e',
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
			}
		} );
	},

	onEditModeSwitched: function( activeMode ) {
		if ( 'edit' !== activeMode ) {
			return;
		}

		this.setSize();
	}
} );
