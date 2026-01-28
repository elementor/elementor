import { debounce } from 'lodash';

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

	initialize() {
		this.trackSearchInputDebounced = debounce( this.trackSearchInput.bind( this ), 300 );
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

			this.trackSearchInputDebounced();
		}

		this.content.currentView.$el.toggle( ! ! value );
	}

	trackSearchInput() {
		const config = elementorCommon?.eventsManager?.config;
		const resultsCount = this.getResultsCount();
		const hasResults = resultsCount > 0;

		elementorCommon?.eventsManager?.dispatchEvent?.( config?.names?.editorOne?.finderSearchInput, {
			app_type: config?.appTypes?.editor,
			window_name: config?.appTypes?.editor,
			interaction_type: config?.triggers?.typing,
			target_type: config?.targetTypes?.searchInput,
			target_name: 'finder',
			interaction_result: hasResults ? config?.interactionResults?.resultsUpdated : config?.interactionResults?.noResults,
			target_location: config?.locations?.topBar,
			location_l1: config?.secondaryLocations?.finder,
			interaction_description: 'Finder search input, follows debounce behavior',
			metadata: {
				results_count: resultsCount,
			},
		} );
	}

	getResultsCount() {
		if ( ! this.content?.currentView ) {
			return 0;
		}

		const $items = this.content.currentView.$el.find( '.elementor-finder__results__item' );
		return $items.filter( ':visible' ).length;
	}
}
