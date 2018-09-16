var HistoryPageView = require( './panel-page' ),
	Manager;

Manager = function() {
	var self = this;

	var addPanelPage = function() {
		elementor.getPanelView().addPage( 'historyPage', {
			view: HistoryPageView,
			title: elementor.translate( 'history' ),
		} );
	};

	var init = function() {
		elementor.on( 'preview:loaded', addPanelPage );

		self.history = require( './history/manager' );

		self.revisions = require( './revisions/manager' );

		self.revisions.init();
	};

	jQuery( window ).on( 'elementor:init', init );
};

module.exports = new Manager();
