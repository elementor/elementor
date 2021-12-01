import CommandBase from './command-base';

export default class CommandInternalBase extends CommandBase {
	static getInstanceType() {
		return 'CommandInternalBase';
	}

	constructor( args, commandsAPI = $e.commandsInternal ) {
		super( args, commandsAPI );
	}

	onBeforeApply( args = {} ) {
		super.onBeforeApply( args );

		const agreements = $e.hooks.runDataAgreement( this.currentCommand, args, true );

		if ( agreements?.length ) {
			this.agreements = agreements;
			debugger;

			throw new $e.modules.HookBreak( { agreements } );
		}
	}
}
