import CommandBase from './command-base';

export default class CommandHookable extends CommandBase {
	isCommandHookable = true;

	run() {
		return this.apply( this.args );
	}

	onBeforeRun( args = {} ) {
		$e.hooks.runUIBefore( this.currentCommand, args );
	}

	onAfterRun( args = {}, result ) {
		$e.hooks.runUIAfter( this.currentCommand, args, result );
	}

	onBeforeApply( args = {} ) {
		$e.hooks.runDataDependency( this.currentCommand, args );
	}

	onAfterApply( args = {}, result ) {
		$e.hooks.runDataAfter( this.currentCommand, args, result );
	}

	onCatchApply( e ) {
		$e.hooks.runDataCatch( this.currentCommand, this.args, e );

		elementorCommon.helpers.consoleError( e );

		$e.hooks.runUICatch( this.currentCommand, this.args, e );
	}
}
