import CommandContainerBase from './command-container-base';

export default class CommandContainerInternal extends CommandContainerBase {
	static getInstanceType() {
		return 'CommandEditorInternal';
	}

	constructor( args ) {
		super( args, $e.commandsInternal );
	}
}
