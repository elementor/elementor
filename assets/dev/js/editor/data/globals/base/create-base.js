import Command from 'elementor-api/modules/command';

export default class CreateBase extends Command {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'setting', 'string', args );
		this.requireArgumentType( 'title', 'string', args );
	}
}
