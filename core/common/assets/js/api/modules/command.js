import CommandBase from './command-base';

export default class Command extends CommandBase {
	static getInstanceType() {
		return 'Command';
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

	/**
	 * TODO: This method should move to command-editor and should not be part of js-api/core.
	 * Function isDataChanged().
	 *
	 * Whether the editor needs to set change flag on/off.
	 *
	 * @returns {boolean}
	 */
	isDataChanged() {
		return false;
	}
}
