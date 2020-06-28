import Command from './command';

export default class CommandInternal extends Command {
	static getInstanceType() {
		return 'CommandInternalBase';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
