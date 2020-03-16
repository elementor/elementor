import CommandHookable from './command-hookable';

export default class CommandInternalBase extends CommandHookable {
	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
