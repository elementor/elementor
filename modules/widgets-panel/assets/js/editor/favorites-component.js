import ComponentBase from 'elementor-api/modules/component-base';
import * as commandsData from './commands-data/';
import * as commands from './commands';

export default class FavoritesComponent extends ComponentBase {
	getNamespace() {
		return 'panel-favorites';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultData() {
		return this.importCommands( commandsData );
	}

	registerAPI() {
		super.registerAPI();
		$e.routes.on( 'run:after', ( component, route ) => {
			if ( 'panel/elements/categories' === route ) {
				this.menuId = 'e-favorite-widget-context-menu';
				this.favoriteWidgetMenu = null;
				this.clickedWidget = null;

				this.addFavoriteWidgetsEvents();
				this.addToolTip();
			}
		} );
	}

	addToolTip() {
		const favoriteCategory = jQuery( '#elementor-panel-category-favorites .elementor-panel-category-title > i' );
		if ( favoriteCategory ) {
			favoriteCategory.tipsy( {
				title: function title() {
					return this.getAttribute( 'data-tooltip' );
				},
				gravity: 's',
			} );
		}
	}

	addFavoriteWidgetsMenu( e ) {
		// Remove the menu if exists
		this.hideFavoriteWidgetsMenu();

		const panel = jQuery( '#elementor-panel' );
		// Find the clicked widget
		this.clickedWidget = jQuery( e.target ).parents( '.elementor-element-wrapper' );
		// Find the name (id) of clicked widget
		this.clickedWidgetId = this.clickedWidget.find( '.elementor-element' ).data( 'id' );
		// Find the category where user clicked
		this.clickedWidgetCat = this.clickedWidget.parents( '.elementor-panel-category' ).attr( 'id' );

		// Decided witch msg display. if clicked on widget under "Favorites" category display: Remove... otherwise Add...
		const menuText = 'elementor-panel-category-favorites' === this.clickedWidgetCat ? 'Remove From Favorites' : 'Add To Favorites';
		// Convert action text to class name
		this.menuClass = menuText.toLowerCase().replaceAll( ' ', '-' );

		// Create menu element with content
		this.favoriteWidgetMenu = jQuery( '<div>', { id: this.menuId, class: this.menuClass } );
		this.favoriteWidgetMenu.html( jQuery( '<span>' ).text( menuText ) );
		// Insert the menu to widget wrapper
		this.favoriteWidgetMenu.insertAfter( panel );

		const screenInnerWidth = jQuery( document ).outerWidth();
		const menuWidth = this.favoriteWidgetMenu.outerWidth();
		const positionX = e.pageX;
		const calcPosition = screenInnerWidth - ( positionX + menuWidth );
		let fixPositionX = positionX - e.offsetX;
		if ( -1 === Math.sign( calcPosition ) ) {
			fixPositionX = positionX + calcPosition;
		}
		if ( this.favoriteWidgetMenu ) {
			this.favoriteWidgetMenu.css( {
				top: e.pageY - 20 + 'px',
				left: fixPositionX + 'px',
			} );
		}
		return false;
	}

	hideFavoriteWidgetsMenu() {
		if ( this.favoriteWidgetMenu ) {
			jQuery( `#${ this.menuId }.${ this.menuClass }` ).remove();
			this.favoriteWidgetMenu = null;
			this.clickedWidget = null;
		}
	}

	addFavoriteWidgetsEvents() {
		jQuery( document ).bind( 'contextmenu click', ( e ) => {
			// Events settings
			const targetId = 'e-favorite-widget-context-menu' === e.target.id;
			const rightClickOnMenu = 'contextmenu' === e.type && targetId;
			const rightClickOnWidgetOutOfMenu = 'contextmenu' === e.type && 'elementor-element' === e.target.offsetParent.className && ! targetId;
			const clickOnMenu = 'click' === e.type && targetId;

			if ( rightClickOnMenu ) {
				return false;
			} else if ( rightClickOnWidgetOutOfMenu ) {
				e.preventDefault();
				// Add the right click menu
				this.addFavoriteWidgetsMenu( e );
			} else if ( clickOnMenu ) {
				e.preventDefault();
				// Set the logic of clicked (add/remove) on menu
				if ( this.clickedWidgetCat && this.clickedWidget ) {
					// Check category widget where user clicked and run command
					if ( 'elementor-panel-category-favorites' === this.clickedWidgetCat ) {
						// Remove widget from DB and from "FAVORITES" category
						$e.run( 'panel-favorites/remove', { widget: this.clickedWidgetId } );
					} else {
						// Add widget to DB and under "FAVORITES" category
						$e.run( 'panel-favorites/add', { widget: this.clickedWidgetId } );
					}
					this.hideFavoriteWidgetsMenu();
				}
			} else {
				this.hideFavoriteWidgetsMenu();
			}
		} );

		elementorFrontend.elements.$window.keyup( ( e ) => {
			const ESC_KEY = 27;

			if ( ESC_KEY === e.keyCode ) {
				this.hideFavoriteWidgetsMenu();
			}
		} );
	}
}
