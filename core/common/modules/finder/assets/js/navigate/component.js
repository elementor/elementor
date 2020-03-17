import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import FinderLayout from './modal/views/layout';
import * as commands from './commands/';

// TODO: Fix, Open and Close commands should not be manged, should be handled by parent.
export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'finder/navigate';
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

	open() {
		super.open();

		// To activate 'finder' route.
		return this.manager.open();
	}

	close() {
		super.close();

		// To de-activate 'finder' route.
		return this.manager.close();
	}

	getModalLayout() {
		return FinderLayout;
	}

	getItemsView() {
		return this.layout.modalContent.currentView.content.currentView;
	}
}
