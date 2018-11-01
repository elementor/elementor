import CategoriesView from './categories';
import StartView from './start';

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

	showStartView() {
		this.content.show( new StartView() );
	}

	showCategoriesView() {
		this.content.show( new CategoriesView() );
	}

	onShow() {
		this.showStartView();
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
		} else {
			this.showStartView();
		}
	}
}
