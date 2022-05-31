import { addElementToDocumentState } from 'elementor-document/elements/utils';

export class Populate extends $e.modules.editor.CommandContainerInternalBase {
	apply( args ) {
		const { documentId, elements } = args;

		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId,
				elements,
			} )
		);
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
			state[ documentId ]
		);
	}
}

export default Populate;
