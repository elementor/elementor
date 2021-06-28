import CommandBase from 'elementor-api/modules/command-base';

/**
 * Exit the UI preview mode on mouseout.
 */
export class ExitPreview extends CommandBase {
	/**
	 * Initialize the command.
	 *
	 * @param {object} args
	 *
	 * @returns {void}
	 */
	apply( args ) {
		const { initialColor } = this.component.currentPicker;

		if ( null === initialColor ) {
			return;
		}

		this.component.renderUI( initialColor );
	}
}
