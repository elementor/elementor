import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as commandsInternal from './commands/internal/';
import * as hooks from './hooks/';
import * as commandsRevisions from './data/editor/documents/';

export default class RevisionsComponent extends ComponentBase {
	/**
	 * @type {Document}
	 */
	currentDocument;

	/**
	 * @type {RevisionsTabView}
	 */
	tab;

	currentPreviewId = null;

	currentPreviewItem = null;

	isRevisionApplied = false;

	collection;

	getNamespace() {
		return 'panel/history/revisions';
	}

	registerAPI() {
		super.registerAPI();

		const documentsComponent = $e.components.get( 'editor/documents' ),
			revisionsCommands = documentsComponent.importCommands( commandsRevisions );

		Object.entries( revisionsCommands ).forEach( ( [ command, callback ] ) => {
			documentsComponent.registerData( command, callback );
		} );
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultCommandsInternal() {
		return this.importCommands( commandsInternal );
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
