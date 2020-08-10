import Command from './command';

export default class CommandCallback extends Command {
	static getInstanceType() {
		return 'CommandCallback';
	}

	/**
	 * Get original callback of the command.
	 *
	 * Support pure callbacks ( Non command-base ).
	 *
	 * @returns {(function())}
	 */
	static getCallback() {
		return this.registerArgs.__callback;
	}

	apply( args = {} ) {
		return this.constructor.getCallback()( args );
	}
}
