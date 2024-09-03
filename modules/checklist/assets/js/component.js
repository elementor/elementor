import * as commands from './commands/';
import index from './commands-data/index';
import steps from './commands-data/steps';
import userProgress from './commands-data/user-progress';
import { toggleChecklistPopup } from './utils/functions';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'checklist';
	}

	static getEndpointFormat() {
		return 'checklist';
	}

	defaultCommands() {
		const modalCommands = super.defaultCommands();

		return {
			togglePopup: toggleChecklistPopup,
			toggleIcon: () => $e.run( 'checklist/toggle-icon' ),
			...modalCommands,
			...this.importCommands( commands ),
		};
	}

	defaultData() {
		return { index, steps, 'user-progress': userProgress };
	}
}
