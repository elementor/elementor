import CommandData from 'elementor-api/modules/command-data';

export class Revisions extends CommandData {
	static getEndpointFormat() {
		return 'documents/{documentId}/revisions/{revisionId}';
	}

	validateArgs( args ) {
		this.requireArgumentType( 'documentId', 'number', args.query );
	}
}

export default Revisions;
