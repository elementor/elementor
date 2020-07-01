import Command from './command';

// TODO - Remove - '-base' from file name.
export default class CommandInternal extends Command {
	static getInstanceType() {
		return 'CommandInternal';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
