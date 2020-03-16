import CommandHookable from './command-hookable';

export default class CommandInternal extends CommandHookable {
	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
