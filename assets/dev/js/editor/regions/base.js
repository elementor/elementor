module.exports = Marionette.Region.extend( {

	storage: null,

	storageSizeKeys: null,

	constructor: function() {
		Marionette.Region.prototype.constructor.apply( this, arguments );

		var savedStorage = elementorCommon.storage.get( this.getStorageKey() );

		this.storage = savedStorage ? savedStorage : this.getDefaultStorage();

		this.storageSizeKeys = Object.keys( this.storage.size );

		this.isDocked = false;

		this.setSize();

		this.setDefaultPosition();

		this.listenTo( elementor.channels.dataEditMode, 'switch', this.onEditModeSwitched );
		elementor.on( 'document:loaded', this.onDocumentLoaded.bind( this ) );

		this.$el.toggleClass( `e-panel-dockable e-panel-dockable-${ this.getDockingSide() }`, this.canFloat() );
	},

	onDocumentLoaded: function( document ) {
		if ( document.config.panel.has_elements ) {
			this.initBehavior();
		}
	},

	getVisibleModes: function() {
		return [
			'settings',
			'edit',
			'picker',
			'preview',
		];
	},

	onEditModeSwitched: function( activeMode ) {
		if ( this.getVisibleModes().includes( activeMode ) && this.storage.visible ) {
			this.open();
		} else {
			this.close( true );
		}
	},

	getDefaultStorage: function() {
		const position = this.getDefaultPosition();

		return {
			visible: false,
			size: {
				width: '',
				height: '',
				top: position.block,
				bottom: '',
				right: '',
				left: '',
				[ this.getDockingSide() ]: position.inline,
			},
		};
	},

	saveStorage: function( key, value ) {
		this.storage[ key ] = value;

		elementorCommon.storage.set( this.getStorageKey(), this.storage );
	},

	saveSize: function( size ) {
		if ( ! size ) {
			size = elementor.helpers.getElementInlineStyle( this.$el, this.storageSizeKeys );
		}

		this.saveStorage( 'size', size );
	},

	canFloat: function() {
		return true;
	},

	canResize: function() {
		return true;
	},

	initBehavior: function() {
		if ( this.canFloat() ) {
			this.$el.draggable( this.getDraggableOptions() );
		}

		if ( this.canResize() ) {
			this.$el.resizable( this.getResizableOptions() );
		}
	},

	getDraggableOptions: function() {
		return {
			iframeFix: true,
			handle: '.e-panel-floatable',
			drag: this.onDrag.bind( this ),
			stop: this.onDragStop.bind( this ),
		};
	},

	getResizableOptions: function() {
		return {
			handles: 'all',
			containment: 'document',
			minWidth: 150,
			maxWidth: 500,
			minHeight: 240,
			start: () => {
				elementor.$previewWrapper.addClass( 'ui-resizable-resizing' );
			},
			stop: () => {
				elementor.$previewWrapper.removeClass( 'ui-resizable-resizing' );

				if ( this.isDocked ) {
					this.storage.size.width = elementor.helpers.getElementInlineStyle( this.$el, [ 'width' ] ).width;

					elementorCommon.storage.set( this.getStorageKey(), this.storage );
				} else {
					this.saveSize();
				}
			},
			resize: ( event, ui ) => {
				this.setSize( ui.size.width + 'px' );
			},
		};
	},

	getDockingSide: function() {
		return elementorCommon.config.isRTL ? 'left' : 'right';
	},

	onDrag: function( event, ui ) {
		this.$el.css( {
			right: 'unset',
			left: 'unset',
		} );

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

		const isOutOfLeft = 0 > ui.position.left,
			isOutOfRight = ui.position.left + this.el.offsetWidth > window.innerWidth,
			isOut = isOutOfLeft || isOutOfRight;

		if ( isOutOfRight ) {
			elementorCommon.elements.$body.css( '--dock-hint-left', '' );
			elementorCommon.elements.$body.css( '--dock-hint-right', '0' );
		} else if ( isOutOfLeft ) {
			elementorCommon.elements.$body.css( '--dock-hint-left', '0' );
			elementorCommon.elements.$body.css( '--dock-hint-right', '' );
		}

		elementorCommon.elements.$body.removeClass( 'elementor-' + this.getStorageKey() + '--float' );
		elementorCommon.elements.$body.toggleClass( 'elementor-' + this.getStorageKey() + '--dock-hint', isOut );
		elementorCommon.elements.$body.toggleClass( 'elementor-' + this.getStorageKey() + '--dock-hint', 'left' === this.getDockingSide() ? isOutOfLeft : isOutOfRight );

		this.$el.toggleClass( 'e-panel-faded', 'left' === this.getDockingSide() ? isOutOfLeft : isOutOfRight );
	},

	onDragStop: function( event, ui ) {
		if ( this.isDocked ) {
			return;
		}

		this.saveSize();

		const elementRight = ui.position.left + this.el.offsetWidth;

		if ( 'left' === this.getDockingSide() && 0 > ui.position.left ) {
			this.dock( 'left' );
		} else if ( 'right' === this.getDockingSide() && elementRight >= innerWidth ) {
			this.dock( 'right' );
		}

		elementorCommon.elements.$body.removeClass( 'elementor-' + this.getStorageKey() + '--dock-hint' );
		this.$el.removeClass( 'e-panel-faded' );
	},

	isPushingContent: function() {
		return true;
	},

	open: function() {
		this.saveStorage( 'visible', true );
		this.$el.addClass( 'e-panel--open' );

		if ( this.isDocked ) {
			this.dock( this.getDockingSide() );
		}
	},

	close: function() {
		this.saveStorage( 'visible', false );
		this.$el.removeClass( 'e-panel--open' );

		const dockedClass = 'elementor-' + this.getStorageKey() + '-docked',
			dockedPositionClass = dockedClass + '--' + this.getDockingSide();

		elementorCommon.elements.$body.removeClass( dockedClass + ' ' + dockedPositionClass );
	},

	dock: function( position ) {
		const dockedClass = 'elementor-' + this.getStorageKey() + '-docked',
			dockedPositionClass = dockedClass + '--' + position;

		this.$el.addClass( 'e-panel-docked' );

		if ( this.isPushingContent() ) {
			elementorCommon.elements.$body.addClass( dockedClass + ' ' + dockedPositionClass );
		}

		this.setSize();

		const resizableOptions = this.getResizableOptions();
		resizableOptions.handles = 'e, w';

		this.$el.css( {
			height: '',
			top: '',
			bottom: '',
			left: '',
			right: '',
			[ this.getDockingSide() ]: '0',
		} );

		// this.setDefaultPosition();

		if ( this.$el.resizable( 'instance' ) ) {
			this.$el.resizable( 'destroy' );
		}

		// TODO: if dock left use 'e' , if dock right use 'w'
		// resizableOptions.handles = elementorCommon.config.isRTL ? 'e' : 'w';

		this.isDocked = true;

		this.saveStorage( 'dockedPosition', position );
	},

	undock: function( silent ) {
		const dockedClass = 'elementor-' + this.getStorageKey() + '-docked',
			dockedPositionClass = dockedClass + '--left' + ' ' + dockedClass + '--right';

		this.$el.removeClass( 'e-panel-docked' );

		elementorCommon.elements.$body.removeClass( dockedClass + ' ' + dockedPositionClass );

		this.setSize();

		elementor.$previewWrapper.css( elementorCommon.config.isRTL ? 'left' : 'right', '' );

		if ( this.$el.resizable( 'instance' ) ) {
			this.$el.resizable( 'destroy' );
		}

		this.setDefaultPosition();

		this.isDocked = false;

		if ( ! silent ) {
			this.saveStorage( 'dockedPosition', false );
		}

		if ( this.canResize() ) {
			this.$el.resizable( this.getResizableOptions() );
		}
	},

	getDefaultPosition() {
		return {
			inline: '48px',
			block: 'calc( 48px + var( --responsive-bar-height ) )',
		};
	},

	setDefaultPosition() {
		const position = this.getDefaultPosition();

		this.$el.css( 'top', position.block );
		this.$el.css( this.getDockingSide(), position.inline );
	},

	/**
	 * Set the "base" size to a specific value or default to the storage-saved value.
	 *
	 * @param {String} size A specific new size.
	 */
	setSize: function( size = null ) {
		if ( size ) {
			this.storage.size.width = size;
		} else {
			this.storage.size.width = this.storage.size.width || elementorCommon.elements.$body.css( '--e-editor-' + this.getStorageKey() + '-width' );
		}

		// Set the "base" size using a CSS variable, and remove the inline CSS that was set by jQuery Resizeable.
		elementorCommon.elements.$body.css( '--e-editor-' + this.getStorageKey() + '-width', this.storage.size.width );
		this.$el.css( 'width', '' );
	},

} );
