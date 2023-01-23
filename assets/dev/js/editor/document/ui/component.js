import ComponentBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentBase {
	getNamespace() {
		return 'document/ui';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		const shouldRun = () => {
			const selectedElements = elementor.selection.getElements();

			if ( ! selectedElements.length ) {
				return false;
			}

			const hasLockedContainers = selectedElements.some( ( container ) => container?.isLocked?.() );

			return ! hasLockedContainers;
		};

		return {
			copy: {
				keys: 'ctrl+c',
				exclude: [ 'input' ],
				dependency: () => shouldRun(),
			},
			delete: {
				keys: 'del',
				exclude: [ 'input' ],
				dependency: () => shouldRun(),
			},
			duplicate: {
				keys: 'ctrl+d',
				dependency: () => shouldRun(),
			},
			paste: {
				keys: 'ctrl+v',
				exclude: [ 'input' ],
			},
			'paste-style': {
				keys: 'ctrl+shift+v',
				exclude: [ 'input' ],
			},
		};
	}
}
