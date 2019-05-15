var TabHistoryView = require( './history/panel-tab' );

import TabRevisionsLoadingView from './revisions/loading';
import TabRevisionsView from './revisions/panel-tab';
import TabRevisionsEmptyView from './revisions/empty';

module.exports = Marionette.LayoutView.extend( {
	template: '#tmpl-elementor-panel-history-page',

	regions: {
		content: '#elementor-panel-history-content',
	},

	ui: {
		tabs: '.elementor-panel-navigation-tab',
	},

	regionViews: {},

	currentTab: null,

	initialize: function() {
		this.initRegionViews();
	},

	initRegionViews: function() {
		const historyItems = elementor.history.history.getItems();

		this.regionViews = {
			actions: {
				view: function() {
					return TabHistoryView;
				},
				options: {
					collection: historyItems,
				},
			},
			revisions: {
				view: () => {
					const revisionsItems = elementor.history.revisions.getItems();

					if ( ! revisionsItems ) {
						return TabRevisionsLoadingView;
					}

					if ( 1 === revisionsItems.length && 'current' === revisionsItems.models[ 0 ].get( 'type' ) ) {
						return TabRevisionsEmptyView;
					}

					return TabRevisionsView;
				},
			},
		};
	},

	getCurrentTab: function() {
		return this.currentTab;
	},

	showView: function( viewName ) {
		const viewDetails = this.regionViews[ viewName ],
			options = viewDetails.options || {},
			View = viewDetails.view();

		if ( this.currentTab && this.currentTab.constructor === View ) {
			return;
		}

		this.currentTab = new View( options );

		this.content.show( this.currentTab );
	},
} );
