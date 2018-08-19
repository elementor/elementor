module.exports = Marionette.Region.extend( {
	el: '#elementor-navigator',

	isDocked: false,

	opened: false,

	storage: {
		visible: false,
		size: {
			width: '',
			height: '',
			top: '',
			bottom: '',
			right: '',
			left: ''
		}
	},

	constructor: function() {
		Marionette.Region.prototype.constructor.apply( this, arguments );

		this.ensurePosition = this.ensurePosition.bind( this );

		var savedStorage = elementor.getStorage( 'navigator' );

		if ( savedStorage ) {
			this.storage = savedStorage;
		}

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched );

		if ( this.storage.visible ) {
			this.open();
		}
	},

	getLayout: function() {
		return this.currentView;
	},

	getDraggableOptions: function() {
		return {
			iframeFix: true,
			handle: '#elementor-navigator__header',
			drag: this.onDrag.bind( this ),
			stop: this.onDragStop.bind( this )
		};
	},

	getResizableOptions: function() {
		var self = this;

		return {
			handles: 'all',
			containment: 'document',
			minWidth: 150,
			maxWidth: 500,
			minHeight: 210,
			start: function() {
				elementor.$previewWrapper.addClass( 'ui-resizable-resizing' );
			},
			stop: function() {
				elementor.$previewWrapper.removeClass( 'ui-resizable-resizing' );

				if ( self.isDocked ) {
					self.storage.size.width = elementor.helpers.getElementInlineStyle( self.$el, [ 'width' ] ).width;

					elementor.setStorage( 'navigator', self.storage );
				} else {
					self.saveSize();
				}
			}
		};
	},

	beforeFirstOpen: function() {
		var NavigatorLayoutView = require( 'elementor-layouts/navigator/layout' );

		this.show( new NavigatorLayoutView() );

		this.$el.draggable( this.getDraggableOptions() );

		this.$el.resizable( this.getResizableOptions() );
	},

	open: function( model ) {
		if ( ! this.opened ) {
			this.beforeFirstOpen();

			this.opened = true;
		}

		this.$el.show();

		if ( this.storage.docked ) {
			this.dock();

			this.setDockedSize();
		} else {
			this.setSize();
		}

		if ( model ) {
			model.trigger( 'request:edit' );
		}

		this.saveStorage( 'visible', true );

		this.ensurePosition();

		elementor.$window.on( 'resize', this.ensurePosition );
	},

	close: function( silent ) {
		this.$el.hide();

		if ( this.isDocked ) {
			this.undock( true );
		}

		if ( ! silent ) {
			this.saveStorage( 'visible', false );
		}

		elementor.$window.off( 'resize', this.ensurePosition );
	},

	dock: function() {
		elementor.$body.addClass( 'elementor-navigator-docked' );

		var side = elementor.config.is_rtl ? 'left' : 'right',
			resizableOptions = this.getResizableOptions();

		this.$el.css( {
			height: '',
			top: '',
			bottom: '',
			left: '',
			right: ''
		} );

		elementor.$previewWrapper.css( side, this.storage.size.width );

		this.$el.resizable( 'destroy' );

		resizableOptions.handles = elementor.config.is_rtl ? 'e' : 'w';

		resizableOptions.resize = function( event, ui ) {
			elementor.$previewWrapper.css( side, ui.size.width );
		};

		this.$el.resizable( resizableOptions );

		this.isDocked = true;

		this.saveStorage( 'docked', true );
	},

	undock: function( silent ) {
		elementor.$body.removeClass( 'elementor-navigator-docked' );

		elementor.$previewWrapper.css( elementor.config.is_rtl ? 'left' : 'right', '' );

		this.setSize();

		this.$el.resizable( 'destroy' );

		this.$el.resizable( this.getResizableOptions() );

		this.isDocked = false;

		if ( ! silent ) {
			this.saveStorage( 'docked', false );
		}
	},

	saveStorage: function( key, value ) {
		this.storage[ key ] = value;

		elementor.setStorage( 'navigator', this.storage );
	},

	saveSize: function() {
		this.saveStorage( 'size', elementor.helpers.getElementInlineStyle( this.$el, [ 'width', 'height', 'top', 'bottom', 'right', 'left' ] ) );
	},

	setSize: function() {
		if ( this.storage.size ) {
			this.$el.css( this.storage.size );
		}
	},

	setDockedSize: function() {
		this.$el.css( 'width', this.storage.size.width );
	},

	ensurePosition: function() {
		if ( this.isDocked ) {
			return;
		}

		var offset = this.$el.offset();

		if ( offset.left > innerWidth ) {
			this.$el.css({
				left: '',
				right: ''
			} );
		}

		if ( offset.top > innerHeight ) {
			this.$el.css( {
				top: '',
				bottom: ''
			} );
		}
	},

	onDrag: function( event, ui ) {
		if ( this.isDocked ) {
			if ( ui.position.left === ui.originalPosition.left ) {
				if ( ui.position.top !== ui.originalPosition.top ) {
					return false;
				}
			} else {
				this.undock();
			}

			return;
		}

		if ( 0 > ui.position.top ) {
			ui.position.top = 0;
		}

		if ( 0 > ui.position.left ) {
			ui.position.left = 0;
		}

		elementor.$body.toggleClass( 'elementor-navigator--dock-hint', ui.position.left + this.el.offsetWidth > innerWidth );
	},

	onDragStop: function( event, ui ) {
		if ( this.isDocked ) {
			return;
		}

		this.saveSize();

		var elementRight = ui.position.left + this.el.offsetWidth;

		if ( elementRight >= innerWidth ) {
			this.dock();
		}

		elementor.$body.removeClass( 'elementor-navigator--dock-hint' );
	},

	onEditModeSwitched: function() {
		var activeMode = elementor.channels.dataEditMode.request( 'activeMode' );

		if ( 'edit' === activeMode && this.storage.visible ) {
			this.open();
		} else {
			this.close( true );
		}
	}
} );
