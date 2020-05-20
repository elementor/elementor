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
		};
	}

	events() {
		return {
			'input @ui.searchInput': 'onSearchInputInput',
		};
	}

	regions() {
		return {
			content: '#elementor-finder__content',
		};
	}

	showCategoriesView() {
		this.content.show( new CategoriesView() );
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
}
