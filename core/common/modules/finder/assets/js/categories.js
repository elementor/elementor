import Category from './category';
import DynamicCategory from './dynamic-category';

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
		return childModel.get( 'dynamic' ) ? DynamicCategory : Category;
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
