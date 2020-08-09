import Command from './command';

export default class CommandInternal extends Command {
	static getInstanceType() {
		return 'CommandInternal';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
