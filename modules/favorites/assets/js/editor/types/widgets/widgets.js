import FavoriteType from '../../favorite-type';
import PanelCategoryBehavior from './behaviors/panel-category-behavior';

export default class Widgets extends FavoriteType {
	constructor() {
		super();

		elementor.hooks.addFilter( 'panel/category/behaviors', this.addCategoryBehavior.bind( this ) );
		elementor.hooks.addFilter( 'panel/element/contextMenuGroups', this.addContextMenuGroups.bind( this ) );
	}

	getName() {
		return 'widgets';
	}

	create( favorite ) {
		const widgetCache = this.getWidgetCache( favorite );

		if ( undefined !== widgetCache ) {
			widgetCache.categories.push( this.getCategorySlug() );

			const result = $e.data.create(
				'favorites/index',
				{},
				{
					type: this.getName(),
					favorite,
				},
			);

			this.refreshCategories();

			return result;
		}

		return false;
	}

	delete( favorite ) {
		const widgetCache = this.getWidgetCache( favorite );

		if ( undefined !== widgetCache ) {
			widgetCache.categories.splice( widgetCache.categories.indexOf( this.getCategorySlug() ), 1 );

			const result = $e.data.delete(
				'favorites/index',
				{
					type: this.getName(),
					favorite,
				},
			);

			this.refreshCategories();

			return result;
		}

		return false;
	}

	toggle( favorite ) {
		const widgetCache = this.getWidgetCache( favorite );

		if ( undefined !== widgetCache ) {
			const args = {
				type: this.getName(),
				favorite,
			};

			if ( this.isFavorite( favorite ) ) {
				return $e.run( 'favorites/delete', args );
			}

			return $e.run( 'favorites/create', args );
		}

		return false;
	}

	/**
	 * Check whether a given widget is already favorite.
	 *
	 * @param {*} widget
	 * @return {boolean} true if this widget is a favorite widget
	 */
	isFavorite( widget ) {
		const widgetCache = this.getWidgetCache( widget );

		if ( undefined !== widgetCache ) {
			return widgetCache.categories
				.includes( this.getCategorySlug() );
		}

		return false;
	}

	/**
	 * Get favorites category name in widgets panel.
	 *
	 * @return {string} favorites category
	 */
	getCategorySlug() {
		return 'favorites';
	}

	addCategoryBehavior( behaviors ) {
		return Object.assign( {}, behaviors, {
			favoriteWidgets: {
				behaviorClass: PanelCategoryBehavior,
			},
		} );
	}

	/**
	 * A filter callback to add the favorites context menu groups to
	 * element view.
	 *
	 * @param {*} groups
	 * @param {*} context
	 * @return {[]} groups
	 */
	addContextMenuGroups( groups, context ) {
		const widget = context.options.model.get( 'widgetType' ) || context.options.model.get( 'elType' );

		return groups.concat( [
			{
				name: 'favorite-toggle',
				actions: [
					{
						name: 'toggle',
						icon: this.isFavorite( widget )
							? 'eicon-heart-o'
							: 'eicon-heart',
						title: this.isFavorite( widget )
							? __( 'Remove from Favorites', 'elementor' )
							: __( 'Add to Favorites', 'elementor' ),
						callback: () => {
							this.toggle( widget );

							if ( this.isFavorite( widget ) ) {
								elementor.notifications.showToast( {
									message: __( 'Added', 'elementor' ),
								} );
							}
						},
					},
				],
			},
		] );
	}

	/**
	 * Re-render the categories view to reflect changes, while restoring
	 * scroll position.
	 */
	refreshCategories() {
		const psElement = elementor.getPanelView().perfectScrollbar.element,
			psScrollTop = psElement.scrollTop,
			psHeight = psElement.scrollHeight;

		$e.route( 'panel/elements/categories', {
			refresh: true,
			onAfter: () => {
				psElement.scrollTop = psScrollTop + ( psElement.scrollHeight - psHeight );
			},
		} );
	}

	/**
	 * Get the widget cache object which stores the widgets config.
	 *
	 * @param {*} widget
	 * @return {{}} widget cache object
	 */
	getWidgetCache( widget ) {
		return elementor.widgetsCache[ widget ];
	}
}
