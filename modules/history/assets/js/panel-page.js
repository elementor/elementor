var TabHistoryView = require( './history/panel-tab' ),
	TabHistoryEmptyView = require( './history/empty' );

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

	events: {
		'click @ui.tabs': 'onTabClick',
	},

	regionViews: {},

	currentTab: null,

	initialize: function() {
		this.initRegionViews();
	},

	initRegionViews: function() {
		const historyItems = elementor.history.history.getItems();

		this.regionViews = {
			history: {
				view: function() {
					if ( historyItems.length ) {
						return TabHistoryView;
					}

					return TabHistoryEmptyView;
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

	activateTab: function( tabName ) {
		this.ui.tabs
			.removeClass( 'elementor-active' )
			.filter( '[data-view="' + tabName + '"]' )
			.addClass( 'elementor-active' );

		this.showView( tabName );
	},

	getCurrentTab: function() {
		return this.currentTab;
	},

	showView: function( viewName ) {
		const viewDetails = this.regionViews[ viewName ],
			options = viewDetails.options || {},
			View = viewDetails.view();

		this.currentTab = new View( options );

		this.content.show( this.currentTab );
	},

	onRender: function() {
		this.showView( 'history' );
	},

	onTabClick: function( event ) {
		this.activateTab( event.currentTarget.dataset.view );
	},

	onDestroy: function() {
		elementor.getPanelView().getFooterView().ui.history.removeClass( 'elementor-open' );
	},
} );
