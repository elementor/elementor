import Component from './component';
import HistoryComponent from './history/component';
import RevisionsComponent from './revisions/component';

const HistoryPageView = require( './panel-page' ),
	Manager = function() {
		const self = this;

		const addPanelPage = function() {
			elementor.getPanelView().addPage( 'historyPage', {
				view: HistoryPageView,
				title: elementor.translate( 'history' ),
			} );
		};

		const init = function() {
			elementor.on( 'preview:loaded', addPanelPage );

			$e.components.register( new Component() );
			$e.components.register( new HistoryComponent() );
			$e.components.register( new RevisionsComponent() );
		};

		jQuery( window ).on( 'elementor:init', init );
	};

module.exports = new Manager();
