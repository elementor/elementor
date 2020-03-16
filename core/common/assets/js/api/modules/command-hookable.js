import CommandBase from './command-base';

export default class CommandHookable extends CommandBase {
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

	/**
	 * Function run().
	 *
	 * Run command with history & hooks.
	 *
	 * @returns {*}
	 */
	run() {
		let result;

		// For UI Hooks.
		this.onBeforeRun( this.args );

		try {
			// For Data hooks.
			this.onBeforeApply( this.args );

			result = this.apply( this.args );
		} catch ( e ) {
			this.onCatchApply( e );

			// Catch 'Hook-Break' that comes from hooks base.
			if ( e instanceof $e.modules.HookBreak ) {
				// Bypass.
				return false;
			}
		}

		const onAfter = ( _result ) => {
			this.onAfterApply( this.args, _result );

			if ( this.isDataChanged() ) {
				$e.internal( 'document/save/set-is-modified', { status: true } );
			}

			// For UI hooks.
			this.onAfterRun( this.args, _result );
		};

		// TODO: Temp code determine if it's a jQuery deferred object.
		if ( result && 'object' === typeof result && result.promise && result.then && result.fail ) {
			result.fail( this.onCatchApply.bind( this ) );
			result.done( onAfter );
		} else {
			onAfter( result );
		}

		return result;
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
