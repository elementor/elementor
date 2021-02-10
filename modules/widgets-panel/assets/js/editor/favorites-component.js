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

	defaultShortcuts() {
		return {
			exit: {
				keys: 'esc',
				dependency: () => {
					return jQuery( `#${ this.$favoriteMenuId }` ).length;
				},
				scopes: [ 'panel', 'preview' ],
			},
		};
	}

	registerAPI() {
		super.registerAPI();
		$e.routes.on( 'run:after', ( component, route ) => {
			if ( 'panel/elements/categories' === route ) {
				this.$panel = jQuery( '#elementor-panel' );
				this.$favoriteMenuId = 'e-favorite-widget-context-menu';

				this.addFavoriteWidgetsEvents();
				this.addToolTip();
			}
		} );
	}

	moveElementInArray( array, from, to ) {
		array.splice( to, 0, array.splice( from, 1 )[ 0 ] );
		return array;
	}

	addToolTip() {
		const $favoriteCategory = jQuery( '#elementor-panel-category-favorites .elementor-panel-category-title' );
		if ( 'favorites' === $favoriteCategory.text().trim().toLowerCase() ) {
			const $iconInfo = jQuery( '<i>', { class: 'eicon-info-circle', 'data-tooltip': __( 'Right click on widgets to add or remove them from favorites', 'elementor' ) } );
			$iconInfo.appendTo( $favoriteCategory );
			const icon = $favoriteCategory.find( '> i' );
			icon.tipsy( {
				title: function title() {
					return this.getAttribute( 'data-tooltip' );
				},
				gravity: 's',
			} );
		}
	}

	displayFavoriteMenu( action, widgetId, menuText, e ) {
		// Remove the menu if exists
		this.removeFavoriteMenu();

		const menuClass = menuText.toLowerCase().replaceAll( ' ', '-' );
		const $favoriteWidgetMenu = jQuery( '<div>', { id: this.$favoriteMenuId, class: menuClass } );
		$favoriteWidgetMenu.html( jQuery( '<span>' ).text( menuText ) );
		$favoriteWidgetMenu.insertAfter( this.$panel );

		this.setPositionMenu( $favoriteWidgetMenu, e );

		if ( widgetId && $favoriteWidgetMenu.length ) {
			this.contextmenuOnFavoritesMenu();
			this.contextmenuOrClickOnOutsideMenu();

			$favoriteWidgetMenu.on( 'click.favorites', ( event ) => {
				event.preventDefault();
				if ( 'add' === action ) {
					// Add widget to DB and "FAVORITES" category
					$e.run( 'panel-favorites/add', { widget: widgetId } );
				}
				if ( 'remove' === action ) {
					// Remove widget from DB and "FAVORITES" category
					$e.run( 'panel-favorites/remove', { widget: widgetId } );
				}
				$favoriteWidgetMenu.off( 'click.favorites', this.removeFavoriteMenu() );
			} );
		}
	}

	setPositionMenu( favoriteWidgetMenu, e ) {
		const menuWidth = favoriteWidgetMenu.outerWidth();
		const setMenuPositionX = elementorCommon.config.isRTL ? ( e.pageX - menuWidth ) : e.pageX;
		if ( favoriteWidgetMenu.length ) {
			favoriteWidgetMenu.css( {
				top: e.pageY + 'px',
				left: setMenuPositionX + 'px',
			} );
		}
	}

	removeFavoriteMenu() {
		const $favoriteWidgetMenu = jQuery( `#${ this.$favoriteMenuId }` );
		if ( $favoriteWidgetMenu.length ) {
			$favoriteWidgetMenu.remove();
		}
	}

	addFavoriteWidgetsEvents() {
		this.contextmenuAddToFavorites();
		this.contextmenuRemoveFromFavorites();
	}

	contextmenuAddToFavorites() {
		const $panelCategories = jQuery( '[ id^=elementor-panel-category- ]:not( [ id=elementor-panel-category-favorites ] )' );
		if ( $panelCategories.length ) {
			$panelCategories.on( 'contextmenu', '.elementor-element', ( e ) => {
				e.preventDefault();
				const widgetId = e.target.offsetParent.dataset.id;
				const menuText = __( 'Add To Favorites', 'elementor' );
				this.displayFavoriteMenu( 'add', widgetId, menuText, e );
			} );
		}
	}

	contextmenuRemoveFromFavorites() {
		const $favoriteCategory = jQuery( '#elementor-panel-category-favorites' );
		if ( $favoriteCategory.length ) {
			$favoriteCategory.on( 'contextmenu', '.elementor-element', ( e ) => {
				e.preventDefault();
				const widgetId = e.target.offsetParent.dataset.id;
				const menuText = __( 'Remove From Favorites', 'elementor' );
				this.displayFavoriteMenu( 'remove', widgetId, menuText, e );
			} );
		}
	}

	contextmenuOnFavoritesMenu() {
		const $menuFavorites = jQuery( `#${ this.$favoriteMenuId }` );
		if ( $menuFavorites.length ) {
			$menuFavorites.on( 'contextmenu.favorites', ( e ) => {
				const targetId = this.$favoriteMenuId === e.target.parentElement.id;
				const rightClickOnMenu = 'contextmenu' === e.type && targetId;
				if ( rightClickOnMenu ) {
					return false;
				}
			} );
		} else {
			$menuFavorites.off( 'contextmenu.favorites' );
		}
	}

	contextmenuOrClickOnOutsideMenu() {
		const $panelClickedOutsideWidgets = jQuery( '#elementor-editor-wrapper' );
		if ( $panelClickedOutsideWidgets.length ) {
			$panelClickedOutsideWidgets.on( 'contextmenu.favoriteMenu click.favoriteMenu', ( e ) => {
				e.preventDefault();
				const targetId = this.$favoriteMenuId === e.target.parentElement.id;
				const rightClickOnMenu = 'contextmenu' === e.type && targetId;
				const rightClickOnWidgetOutOfMenu = 'contextmenu' === e.type && 'elementor-element' === e.target.offsetParent.className && ! targetId;
				const clickOnMenu = 'click' === e.type && targetId;

				if ( ! rightClickOnMenu && ! rightClickOnWidgetOutOfMenu && ! clickOnMenu ) {
					$panelClickedOutsideWidgets.off( 'contextmenu.favoriteMenu click.favoriteMenu', this.removeFavoriteMenu() );
				}
			} );
		}
	}
}
