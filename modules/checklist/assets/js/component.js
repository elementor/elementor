import * as commands from './commands/';
import { Index } from './commands-data/index';
import { Steps } from './commands-data/steps';
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
			... modalCommands,
			... this.importCommands( commands ),
		};
	}

	defaultData() {
		return { index: Index, steps: Steps };
	}
}
