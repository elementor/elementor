/**
 * Exit the UI preview mode on mouseout.
 */
export class ExitPreview extends $e.modules.CommandBase {
	/**
	 * Initialize the command.
	 *
	 * @return {void}
	 */
	apply() {
		const { initialColor } = this.component.currentPicker;

		if ( null === initialColor ) {
			return;
		}

		this.component.renderUI( initialColor );
	}
}
