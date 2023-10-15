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

	/**
	 * @deprecated since 2.9.0, use `elementor.documents.getCurrent().history` instead.
	 */
	get history() {
		elementorDevTools.deprecation.deprecated( 'elementor.history.history', '2.9.0', 'elementor.documents.getCurrent().history' );

		return elementor.documents.getCurrent().history;
	}

	/**
	 * @deprecated since 2.9.0, use `elementor.documents.getCurrent().revisions` instead.
	 */
	get revisions() {
		elementorDevTools.deprecation.deprecated( 'elementor.history.revisions', '2.9.0', 'elementor.documents.getCurrent().revisions' );

		return elementor.documents.getCurrent().revisions;
	}
}
