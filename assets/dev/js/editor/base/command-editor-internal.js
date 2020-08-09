import CommandEditor from './command-editor';

export default class CommandInternal extends CommandEditor {
	static getInstanceType() {
		return 'CommandEditorInternal';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
