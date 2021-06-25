import CommandBase from './command-base';

export default class CommandInternal extends CommandBase {
	static getInstanceType() {
		return 'CommandInternal';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}
}
