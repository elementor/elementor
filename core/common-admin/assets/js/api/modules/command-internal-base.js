import CommandBase from './command-base';

export default class CommandInternalBase extends CommandBase {
	static getInstanceType() {
		return 'CommandInternalBase';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
