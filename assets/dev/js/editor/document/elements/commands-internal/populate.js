import { addElementToDocumentState } from 'elementor-document/elements/utils';
import Document from 'elementor-editor/components/documents/document';

export class Populate extends $e.modules.editor.CommandContainerInternalBase {
	validateArgs() {
		this.requireArgumentInstance( 'document', Document );
	}

	apply( args ) {
		const { document, elements } = args;

		$e.store.dispatch(
			this.component.store.actions.populate( {
				documentId: document.id,
				elements,
			} ),
		);

		// TODO: BC for initializing Marionette views.
		elementor.initElements();
	}

	static reducer( state, { payload } ) {
		const { documentId, elements } = payload;

		state[ documentId ] = {
			document: {
				id: 'document',
				elements: [],
			},
		};

		addElementToDocumentState(
			elements,
			state[ documentId ],
		);
	}
}

export default Populate;
