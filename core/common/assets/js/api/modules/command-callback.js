import Command from './command';

export default class CommandCallback extends Command {
	static getInstanceType() {
		return 'CommandCallback';
	}

	static getCallback() {
		return this.registerArgs.__callback;
	}

	apply( args = {} ) {
		return this.constructor.getCallback()( args );
	}
}
