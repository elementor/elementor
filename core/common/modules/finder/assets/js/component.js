import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import FinderLayout from './modal/views/layout';
import * as commands from './commands/';

export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'finder';
	}

	defaultShortcuts() {
		return {
			'': {
				keys: 'ctrl+e',
			},
			down: {
				keys: 'down',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView();
				},
			},
			up: {
				keys: 'up',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView();
				},
			},
			select: {
				keys: 'enter',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView().$activeItem;
				},

			},
		};
	}

	defaultCommands() {
		const modalCommands = super.defaultCommands();

		return {
			... modalCommands,
			... this.importCommands( commands ),
		};
	}

	getModalLayout() {
		return FinderLayout;
	}

	getItemsView() {
		return this.layout.modalContent.currentView.content.currentView;
	}
}
