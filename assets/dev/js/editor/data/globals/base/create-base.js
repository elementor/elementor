import CommandEditorBase from 'elementor-editor/base/command-editor-base';

export default class CreateBase extends CommandEditorBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'setting', 'string', args );
		this.requireArgumentType( 'title', 'string', args );
	}

	// The inheritance does change the data, but does not required editor save, but change it directly via $e.data.
	isDataChanged() {
		return false;
	}
}
