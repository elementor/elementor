var TabHistoryView = require( './history/panel-tab' );

import RevisionsTabView from './revisions/view/tab';
import RevisionsTabEmptyView from './revisions/view/tab-empty';
import RevisionsTabLoadingView from './revisions/view/tab-loading';

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

	/**
	 * @type {Document}
	 */
	document: null,

	initialize: function( options ) {
		this.document = options.document || elementor.documents.getCurrent();

		this.initRegionViews();
	},

	initRegionViews: function() {
		const historyItems = this.document.history.getItems();

		this.regionViews = {
			actions: {
				view: () => {
					return TabHistoryView;
				},
				options: {
					collection: historyItems,
					history: this.document.history,
				},
			},
			revisions: {
				view: () => {
					const revisionsItems = this.document.revisions.getItems();

					if ( ! revisionsItems ) {
						return RevisionsTabLoadingView;
					}

					if ( 1 === revisionsItems.length && 'current' === revisionsItems.models[ 0 ].get( 'type' ) ) {
						return RevisionsTabEmptyView;
					}

					return RevisionsTabView;
				},
				options: {
					document: this.document,
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
