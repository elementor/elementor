import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';
import * as commandsInternal from './commands/internal/';
import * as hooks from './hooks/';

export default class RevisionsComponent extends ComponentBase {
	/**
	 * @type {Document}
	 */
	currentDocument;

	/**
	 * Temporary.
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

	getRevisionViewData( revisionView, onSuccessCallback = null ) {
		const document = this.currentDocument;

		document.revisions.getRevisionDataAsync( revisionView.model.get( 'id' ), {
			success: ( data ) => {
				if ( document.config.panel.has_elements ) {
					document.revisions.setEditorData( data.elements );
				}

				elementor.settings.page.model.set( data.settings );

				this.tab.setRevisionsButtonsActive( true );

				this.tab.enterReviewMode();

				if ( onSuccessCallback ) {
					onSuccessCallback( data );
				}
			},
			error: ( errorMessage ) => {
				this.currentPreviewItem = null;

				this.currentPreviewId = null;

				alert( errorMessage );
			},
		} );
	}
}
