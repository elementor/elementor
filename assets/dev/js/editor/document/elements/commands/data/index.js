import CommandData from 'elementor-api/modules/command-data';

class Index extends CommandData {
	validateArgs( args ) {
		this.requireArgumentType( 'document_id', 'number', args );
	}
}

export { Index };
