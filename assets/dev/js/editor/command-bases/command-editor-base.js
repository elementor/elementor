import CommandBase from 'elementor-api/modules/command-base';

/**
 * This class should be used only when its 'really' required.
 * Not evey command in the editor should use this only when you required to have the logic in it.
 */
export default class CommandEditorBase extends CommandBase {
	static getInstanceType() {
		return 'CommandEditorBase';
	}

	/**
	 * Function requireContainer().
	 *
	 * Validate `arg.container` & `arg.containers`.
	 *
	 * @param {{}} args
	 *
	 * @throws {Error}
	 */
	requireContainer( args = this.args ) {
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

	onAfterApply( args = {}, result ) {
		super.onAfterApply( args, result );

		if ( this.isDataChanged() ) {
			$e.internal( 'document/save/set-is-modified', { status: true } );
		}
	}

	/**
	 * Whether the editor needs to set change flag on/off.
	 *
	 * @returns {boolean}
	 */
	isDataChanged() {
		elementorModules.ForceMethodImplementation();
	}
}
