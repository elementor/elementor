import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as hooks from './hooks/';

export default class RevisionsComponent extends ComponentBase {
	/**
	 * @type {Document}
	 */
	currentDocument;

	getNamespace() {
		return 'panel/history/revisions';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultShortcuts() {
		return {
			up: {
				keys: 'up',
				scopes: [ this.getNamespace() ],
			},
			down: {
				keys: 'down',
				scopes: [ this.getNamespace() ],
			},
		};
	}

	navigate( up ) {
		if ( elementor.documents.getCurrent().revisions.getItems().length > 1 ) {
			elementor.getPanelView().getCurrentPageView().currentTab.navigate( up );
		}
	}
}
