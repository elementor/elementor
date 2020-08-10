import CommandBase from './command-base';

export default class Command extends CommandBase {
	static getInstanceType() {
		return 'Command';
	}

	onBeforeRun( args = {} ) {
		$e.hooks.runUIBefore( this.command, args );
	}

	onAfterRun( args = {}, result ) {
		$e.hooks.runUIAfter( this.command, args, result );
	}

	onBeforeApply( args = {} ) {
		$e.hooks.runDataDependency( this.command, args );
	}

	onAfterApply( args = {}, result ) {
		$e.hooks.runDataAfter( this.command, args, result );
	}

	onCatchApply( e ) {
		$e.hooks.runDataCatch( this.command, this.args, e );

		elementorCommon.helpers.consoleError( e );

		$e.hooks.runUICatch( this.command, this.args, e );
	}
}
