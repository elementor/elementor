import CommandBaseOriginal from './command-base-original';

export default class Command extends CommandBaseOriginal {
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
