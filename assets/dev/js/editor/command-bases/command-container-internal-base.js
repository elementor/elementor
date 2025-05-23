import CommandContainerBase from './command-container-base';

/**
 * @name $e.modules.editor.CommandContainerInternalBase
 */
export default class CommandContainerInternalBase extends CommandContainerBase {
	static getInstanceType() {
		return 'CommandContainerInternalBase';
	}

	constructor( args ) {
		super( args, $e.commandsInternal );
	}
}
