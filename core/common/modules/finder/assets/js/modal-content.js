import CategoriesView from './categories';

export default class extends Marionette.LayoutView {
	id() {
		return 'elementor-finder';
	}

	getTemplate() {
		return '#tmpl-elementor-finder';
	}

	ui() {
		return {
			searchInput: '#elementor-finder__search__input',
			categoryItem: '.elementor-finder__results__item',
		};
	}

	events() {
		return {
			'input @ui.searchInput': 'onSearchInputInput',
			'mouseenter @ui.categoryItem': 'onCategoryItemMouseEnter',
		};
	}

	regions() {
		return {
			content: '#elementor-finder__content',
		};
	}

	initialize() {
		this.$activeItem = null;
	}

	showCategoriesView() {
		this.content.show( new CategoriesView() );
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

	onShow() {
		this.addHotKeys();
	}

	onSearchInputInput() {
		const value = this.ui.searchInput.val();

		if ( value ) {
			elementorCommon.finder.channel
				.reply( 'filter:text', value )
				.trigger( 'filter:change' );

			if ( ! ( this.content.currentView instanceof CategoriesView ) ) {
				this.showCategoriesView();
			}
		}

		this.content.currentView.$el.toggle( ! ! value );
	}

	onCategoryItemMouseEnter( event ) {
		this.activateItem( jQuery( event.currentTarget ) );
	}
}
