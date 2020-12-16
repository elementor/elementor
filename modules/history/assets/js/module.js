import Component from './component';
import HistoryComponent from './history/component';
import RevisionsComponent from './revisions/component';
import PanelPage from './panel-page';

export default class Manager {
	constructor() {
		elementorCommon.elements.$window.on( 'elementor:loaded', this.init );
	}

	init() {
		$e.components.register( new Component() );
		$e.components.register( new HistoryComponent() );
		$e.components.register( new RevisionsComponent() );

		elementor.on( 'panel:init', () => {
			elementor.getPanelView().addPage( 'historyPage', {
				view: PanelPage,
				title: __( 'History', 'elementor' ),
			} );
		} );
	}

	get history() {
		elementorCommon.helpers.softDeprecated( 'elementor.history.history', '2.9.0', 'elementor.documents.getCurrent().history' );
		return elementor.documents.getCurrent().history;
	}

	get revisions() {
		elementorCommon.helpers.softDeprecated( 'elementor.history.revisions', '2.9.0', 'elementor.documents.getCurrent().revisions' );
		return elementor.documents.getCurrent().revisions;
	}
}
