import Command from './command';

export default class CommandCallback extends Command {
	static getInstanceType() {
		return 'CommandCallback';
	}

	static getCallback() {
		return this.registerArgs.__callback;
	}

	apply( args = {} ) {
		return this.constructor.getCallback().apply( $e.commands.getComponent( $e.commands.getCurrentLast() ), [ args ] );
	}
}
