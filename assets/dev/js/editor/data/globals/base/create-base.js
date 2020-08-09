import CommandEditor from 'elementor-editor/base/command-editor';

export default class CreateBase extends CommandEditor {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'setting', 'string', args );
		this.requireArgumentType( 'title', 'string', args );
	}
}
