import Category from './category';
import RemoteCategory from './remote-category';

export default class extends Marionette.CompositeView {
	id() {
		return 'elementor-assistant__results-container';
	}

	ui() {
		return {
			noResults: '#elementor-assistant__no-results',
		};
	}

	getTemplate() {
		return '#tmpl-elementor-assistant-results-container';
	}

	getChildView( childModel ) {
		return childModel.get( 'remote' ) ? RemoteCategory : Category;
	}

	initialize() {
		this.childViewContainer = '#elementor-assistant__results';

		this.collection = new Backbone.Collection( elementorCommon.assistant.getSettings( 'data' ) );
	}

	onChildviewToggleVisibility() {
		const allCategoriesAreEmpty = this.children.every( ( child ) => ! child.isVisible );

		this.ui.noResults.toggle( allCategoriesAreEmpty );
	}
}
