import CommandData from 'elementor-api/modules/command-data';

class Elements extends CommandData {
	static getEndpointFormat() {
		return 'editor/documents/{documentId}/elements/{elementId}';
	}

	validateArgs( args ) {
		this.requireArgumentType( 'documentId', 'number', args.query );
	}
}

export { Elements };
