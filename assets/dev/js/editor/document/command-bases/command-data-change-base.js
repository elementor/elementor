import CommandContainerBase from 'elementor-editor/command-bases/command-container-base';

export default class CommandDataChangeBase extends CommandContainerBase {
	static getInstanceType() {
		return 'CommandDataChangeBase';
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
