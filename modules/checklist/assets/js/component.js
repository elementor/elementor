import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import * as commands from './commands/';

export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'checklist';
	}

	defaultCommands() {
		const modalCommands = super.defaultCommands();

		return {
			togglePopup: () => $e.run( 'checklist/toggle-popup' ),
			toggleIcon: () => $e.run( 'checklist/toggle-icon' ),
			... modalCommands,
			... this.importCommands( commands ),
		};
	}
}
