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
	},

	getDefaultStorage: function() {
		return {
			visible: false,
			size: {
				width: '',
				height: '',
				top: '',
				bottom: '',
				right: '',
				left: '',
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

	initBehavior: function() {
		this.$el.draggable( this.getDraggableOptions() );
		this.$el.resizable( this.getResizableOptions() );
	},

	getDraggableOptions: function() {
		return {
			iframeFix: true,
			handle: '#elementor-' + this.getStorageKey() + '__header', //TODO: Fix __header for panel
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

	dock: function( position ) { //TODO: fix panel dock position after refresh
		const dockedClass = 'elementor-' + this.getStorageKey() + '-docked',
			dockedPositionClass = dockedClass + '--' + position;

		elementorCommon.elements.$body.addClass( dockedClass + ' ' + dockedPositionClass );//TODO: Use CSS
		this.setSize();

		const resizableOptions = this.getResizableOptions();

		this.$el.css( {
			height: '',
			top: '',
			bottom: '',
			left: '',
			right: '',
		} );

		if ( this.$el.resizable( 'instance' ) ) {
			this.$el.resizable( 'destroy' );
		}

		// TODO: if dock left use 'e' , if dock right use 'w'
		// resizableOptions.handles = elementorCommon.config.isRTL ? 'e' : 'w';
		resizableOptions.handles = 'e, w';

		this.$el.resizable( resizableOptions );

		this.isDocked = true;

		this.saveStorage( 'dockedPosition', position );
	},

	undock: function( silent ) {
		const dockedClass = 'elementor-' + this.getStorageKey() + '-docked',
			dockedPositionClass = dockedClass + '--left' + ' ' + dockedClass + '--right';

		elementorCommon.elements.$body.removeClass( dockedClass + ' ' + dockedPositionClass );

		this.setSize();

		elementor.$previewWrapper.css( elementorCommon.config.isRTL ? 'left' : 'right', '' );

		if ( this.$el.resizable( 'instance' ) ) {
			this.$el.resizable( 'destroy' );

			this.$el.resizable( this.getResizableOptions() );
		}

		this.isDocked = false;

		if ( ! silent ) {
			this.saveStorage( 'dockedPosition', false );
		}
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
