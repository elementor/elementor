import CommandBase from './command-base';

export default class CommandInternalBase extends CommandBase {
	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
