import CommandData from 'elementor-api/modules/command-data';

class Index extends CommandData {
	validateArgs( args ) {
		this.requireArgumentType( 'document_id', 'string', args );
	}
}

export { Index };
