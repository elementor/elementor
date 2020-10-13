import CommandData from 'elementor-api/modules/command-data';

/**
 * TODO:
 * Currently its 'editor/documents/revisions-data' should be 'editor/documents/revisions/data'.
 * both frontend and backend should work the same.
 */
export class RevisionsData extends CommandData {
	static getEndpointFormat() {
		return 'documents/{documentId}/revisions/{revisionId}/data';
	}

	validateArgs( args ) {
		this.requireArgumentType( 'documentId', 'number', args.query );
		this.requireArgumentType( 'revisionId', 'number', args.query );
	}
}

export default RevisionsData;
