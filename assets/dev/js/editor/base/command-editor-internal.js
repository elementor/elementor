import CommandEditor from './command-editor';

export default class CommandEditorInternal extends CommandEditor {
	static getInstanceType() {
		return 'CommandEditorInternal';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
