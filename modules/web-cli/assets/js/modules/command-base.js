import CommandInfra from './command-infra';
import Deprecation from 'elementor-api/utils/deprecation';

/**
 * @name $e.modules.CommandBase
 */
export default class CommandBase extends CommandInfra {
	static getInstanceType() {
		return 'CommandBase';
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
		this.runCatchHooks( e );
	}

	/**
	 * Run all the catch hooks.
	 *
	 * @param {Error} e
	 */
	runCatchHooks( e ) {
		$e.hooks.runDataCatch( this.command, this.args, e );
		$e.hooks.runUICatch( this.command, this.args, e );
	}

	/**
	 * TODO - Remove - Backwards compatibility.
	 *
	 * Function requireContainer().
	 *
	 * Validate `arg.container` & `arg.containers`.
	 *
	 * @param {{}} args
	 * @deprecated since 3.7.0, extend `$e.modules.editor.CommandContainerBase` or `$e.modules.editor.CommandContainerInternalBase` instead.
	 *
	 * @throws {Error}
	 */
	requireContainer( args = this.args ) {
		Deprecation.deprecated( 'requireContainer()', '3.7.0', 'Extend `$e.modules.editor.CommandContainerBase` or `$e.modules.editor.CommandContainerInternalBase`' );

		if ( ! args.container && ! args.containers ) {
			throw Error( 'container or containers are required.' );
		}

		if ( args.container && args.containers ) {
			throw Error( 'container and containers cannot go together please select one of them.' );
		}

		const containers = args.containers || [ args.container ];

		containers.forEach( ( container ) => {
			this.requireArgumentInstance( 'container', elementorModules.editor.Container, { container } );
		} );
	}
}
