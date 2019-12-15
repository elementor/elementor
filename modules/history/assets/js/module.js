import Component from './component';
import HistoryComponent from './history/component';
import RevisionsComponent from './revisions/component';

import PanelPage from './panel-page';

export default class Manager {
	static loadedOnce = false;

	constructor() {
		$e.components.register( new Component() );

		$e.components.register( new HistoryComponent() );
		$e.components.register( new RevisionsComponent() );

		if ( ! this.constructor.loadedOnce ) {
			elementor.getPanelView().addPage( 'historyPage', {
				view: PanelPage,
				title: elementor.translate( 'history' ),
			} );
		}

		// Backward compatibility.
		const currentDocument = elementor.documents.getCurrent();

		this.history = currentDocument.history;
		this.revisions = currentDocument.revisions;

		this.constructor.loadedOnce = true;
	}
}
