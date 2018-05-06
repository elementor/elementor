var Module = require( 'elementor-utils/module' ),
	ContextMenu;

ContextMenu = Module.extend( {

	modal: null,

	getDefaultSettings: function() {
		return {
			actions: {},
			classes: {
				list: 'elementor-context-menu-list',
				item: 'elementor-context-menu-list__item',
				itemTypePrefix: 'elementor-context-menu-list__item-',
				itemTitle: 'elementor-context-menu-list__item__title',
				itemShortcut: 'elementor-context-menu-list__item__shortcut',
				itemDisabled: 'elementor-context-menu-list__item--disabled',
				divider: 'elementor-context-menu-list__divider'
			}
		};
	},

	buildActionItem: function( action ) {
		var self = this;

		var classes = self.getSettings( 'classes' );

		if ( '__divider__' === action.name ) {
			return jQuery( '<div>', { 'class': classes.divider } );
		}

		var $item = jQuery( '<div>', { 'class': classes.item + ' ' + classes.itemTypePrefix + action.name } ),
			$itemTitle = jQuery( '<div>', { 'class': classes.itemTitle } ).text( action.title );

		$item.html( $itemTitle );

		if ( action.shortcut ) {
			var $itemShortcut = jQuery( '<div>', { 'class': classes.itemShortcut } ).text( action.shortcut );

			$item.append( $itemShortcut );
		}

		if ( action.callback ) {
			$item.on( 'click', function() {
				action.callback();

				self.modal.hide();
			} );
		}

		if ( ! action.callback && ! action.actions ) {
			$item.addClass( classes.itemDisabled );
		}

		return $item;
	},

	buildActionsList: function() {
		var self = this,
			classes = self.getSettings( 'classes' ),
			actions = self.getSettings( 'actions' ),
			$list = jQuery( '<div>', { 'class': classes.list } );

		actions.forEach( function( action ) {
			$list.append( self.buildActionItem( action ) );
		} );

		return $list;
	},

	initModal: function() {
		this.modal = elementor.dialogsManager.createWidget( 'simple', {
			className: 'elementor-context-menu',
			message: this.buildActionsList(),
			iframe: elementor.$preview,
			effects: {
				hide: 'hide',
				show: 'show'
			},
			hide: {
				onOutsideContextMenu: true
			},
			position: {
				my: 'left top',
				collision: 'fit'
			}
		} );
	},

	show: function( event ) {
		if ( ! this.modal ) {
			this.initModal();
		}

		this.modal.setSettings( 'position', {
			of: event
		} );

		this.modal.show();
	},

	destroy: function() {
		if ( this.modal ) {
			this.modal.destroy();
		}
	}
} );

module.exports = ContextMenu;
