import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';

export default class CreateBase extends CommandContainerBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'setting', 'string', args );
		this.requireArgumentType( 'title', 'string', args );
	}
}
