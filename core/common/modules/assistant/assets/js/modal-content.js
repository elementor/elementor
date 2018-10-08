import CategoriesView from './categories';
import StartView from './start';

export default class extends Marionette.LayoutView {
	id() {
		return 'elementor-assistant';
	}

	getTemplate() {
		return '#tmpl-elementor-assistant';
	}

	ui() {
		return {
			searchInput: '#elementor-assistant__search__input',
		};
	}

	events() {
		return {
			'input @ui.searchInput': 'onSearchInputInput',
		};
	}

	regions() {
		return {
			content: '#elementor-assistant__content',
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

		elementorCommon.assistant.channel
			.reply( 'filter:text', value )
			.trigger( 'filter:change' );

		if ( value ) {
			if ( ! ( this.content.currentView instanceof CategoriesView ) ) {
				this.showCategoriesView();
			}
		} else {
			this.showStartView();
		}
	}
}
