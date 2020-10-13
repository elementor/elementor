import CommandData from 'elementor-api/modules/command-data';

class Index extends CommandData {
	static getEndpointFormat() {
		return 'documents/{documentId}';
	}

	validateArgs( args = {} ) {
		this.requireArgumentType( 'documentId', 'number', args.query );
	}
}

export { Index };
