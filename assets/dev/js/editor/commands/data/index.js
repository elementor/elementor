import CommandData from 'elementor-api/modules/command-data';

class Index extends CommandData {
	static getEndpointFormat() {
		return 'editor/documents/index/{documentId}/';
	}

	validateArgs( args = {} ) {
		this.requireArgumentType( 'documentId', 'number', args.query );
	}
}

export { Index };
export { Elements } from './elements';
