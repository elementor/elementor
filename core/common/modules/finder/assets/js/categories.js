import Category from './category';
import DynamicCategory from './dynamic-category';

export default class extends Marionette.CompositeView {
	id() {
		return 'elementor-finder__results-container';
	}

	ui() {
		return {
			noResults: '#elementor-finder__no-results',
			categoryItem: '.elementor-finder__results__item',
		};
	}

	events() {
		return {
			'mouseenter @ui.categoryItem': 'onCategoryItemMouseEnter',
		};
	}

	getTemplate() {
		return '#tmpl-elementor-finder-results-container';
	}

	getChildView( childModel ) {
		return childModel.get( 'dynamic' ) ? DynamicCategory : Category;
	}

	initialize() {
		this.$activeItem = null;

		this.childViewContainer = '#elementor-finder__results';

		this.collection = new Backbone.Collection( Object.values( elementorCommon.finder.getSettings( 'data' ) ) );

		this.addHotKeys();
	}

	activateItem( $item ) {
		if ( this.$activeItem ) {
			this.$activeItem.removeClass( 'elementor-active' );
		}

		$item.addClass( 'elementor-active' );

		this.$activeItem = $item;
	}

	activateNextItem( reverse ) {
		const $allItems = jQuery( this.ui.categoryItem.selector );

		let nextItemIndex = 0;

		if ( this.$activeItem ) {
			nextItemIndex = $allItems.index( this.$activeItem ) + ( reverse ? -1 : 1 );

			if ( nextItemIndex >= $allItems.length ) {
				nextItemIndex = 0;
			} else if ( nextItemIndex < 0 ) {
				nextItemIndex = $allItems.length - 1;
			}
		}

		const $nextItem = $allItems.eq( nextItemIndex );

		this.activateItem( $nextItem );

		$nextItem[ 0 ].scrollIntoView( { block: 'nearest' } );
	}

	goToActiveItem() {
		this.$activeItem.children( 'a' )[ 0 ].click();
	}

	addHotKeys() {
		const DOWN_ARROW = 40,
			UP_ARROW = 38,
			ENTER = 13;

		elementorCommon.hotKeys.addHotKeyHandler( DOWN_ARROW, 'finderNextItem', {
			isWorthHandling: () => elementorCommon.finder.getLayout().getModal().isVisible(),
			handle: () => this.activateNextItem(),
		} );

		elementorCommon.hotKeys.addHotKeyHandler( UP_ARROW, 'finderPreviousItem', {
			isWorthHandling: () => elementorCommon.finder.getLayout().getModal().isVisible(),
			handle: () => this.activateNextItem( true ),
		} );

		elementorCommon.hotKeys.addHotKeyHandler( ENTER, 'finderSelectItem', {
			isWorthHandling: () => elementorCommon.finder.getLayout().getModal().isVisible() && this.$activeItem,
			handle: () => this.goToActiveItem(),
		} );
	}

	onCategoryItemMouseEnter( event ) {
		this.activateItem( jQuery( event.currentTarget ) );
	}

	onChildviewToggleVisibility() {
		const allCategoriesAreEmpty = this.children.every( ( child ) => ! child.isVisible );

		this.ui.noResults.toggle( allCategoriesAreEmpty );
	}
}
