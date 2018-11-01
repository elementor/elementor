import Category from './category';
import RemoteCategory from './remote-category';

export default class extends Marionette.CompositeView {
	id() {
		return 'elementor-finder__results-container';
	}

	ui() {
		return {
			noResults: '#elementor-finder__no-results',
		};
	}

	getTemplate() {
		return '#tmpl-elementor-finder-results-container';
	}

	getChildView( childModel ) {
		return childModel.get( 'remote' ) ? RemoteCategory : Category;
	}

	initialize() {
		this.childViewContainer = '#elementor-finder__results';

		this.collection = new Backbone.Collection( Object.values( elementorCommon.finder.getSettings( 'data' ) ) );
	}

	onChildviewToggleVisibility() {
		const allCategoriesAreEmpty = this.children.every( ( child ) => ! child.isVisible );

		this.ui.noResults.toggle( allCategoriesAreEmpty );
	}
}
