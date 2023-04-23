import { getQueryParam, removeQueryParam } from 'elementor-editor-utils/query-params';

export class RemoveActiveDocumentQueryParam extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/close';
	}

	getId() {
		return 'remove-active-document-query-param';
	}

	apply( args ) {
		const activeDocumentId = parseInt( getQueryParam( 'active-document' ) ),
			closedDocumentId = parseInt( args.id );

		if ( activeDocumentId === closedDocumentId ) {
			removeQueryParam( 'active-document' );
		}
	}
}

export default RemoveActiveDocumentQueryParam;
