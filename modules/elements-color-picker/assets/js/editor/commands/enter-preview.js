import CommandBase from 'elementor-api/modules/command-base';

export class EnterPreview extends CommandBase {
	/**
	 * Initialize the command.
	 *
	 * @param {object} args
	 *
	 * @returns {void}
	 */
	apply( args ) {
		this.component.renderUI( args.value );
	}
}
