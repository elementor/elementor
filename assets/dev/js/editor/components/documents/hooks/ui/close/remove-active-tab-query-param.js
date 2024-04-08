import { getQueryParam, removeQueryParam } from 'elementor-editor-utils/query-params';

export class RemoveActiveTabQueryParam extends $e.modules.hookUI.After {
	getCommand() {
		return 'editor/documents/close';
	}

	getId() {
		return 'remove-active-tab-query-param';
	}

	apply( args ) {
		const activeTab = getQueryParam( 'active-tab' ),
			activeDocumentId = parseInt( args.previous_active_document_id ),
			closedDocumentId = parseInt( args.id );

		if ( activeDocumentId === closedDocumentId && activeTab ) {
			removeQueryParam( 'active-tab' );
		}
	}
}

export default RemoveActiveTabQueryParam;
