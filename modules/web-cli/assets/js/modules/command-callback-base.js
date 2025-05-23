import CommandBase from './command-base';

/**
 * To support pure callbacks in the API(commands.js), to ensure they have registered with the proper context.
 */
export default class CommandCallbackBase extends CommandBase {
	static getInstanceType() {
		return 'CommandCallbackBase';
	}

	/**
	 * Get original callback of the command.
	 *
	 * Support pure callbacks ( Non command-base ).
	 *
	 * @return {()=>{}} Command Results.
	 */
	static getCallback() {
		return this.registerConfig.callback;
	}

	apply( args = {} ) {
		return this.constructor.getCallback()( args );
	}
}
