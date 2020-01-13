import CommandBase from './command-base';

export default class CommandInternalBase extends CommandBase {
	constructor( args, manager = $e.commandsInternal ) {
		super( args, manager );
	}
}
