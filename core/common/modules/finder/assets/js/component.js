import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import FinderLayout from './modal-layout';
import CommandHookable from 'elementor-api/modules/command-hookable';

export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'finder';
	}

	defaultShortcuts() {
		return {
			'': {
				keys: 'ctrl+e',
			},
			'navigate/down': {
				keys: 'down',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView();
				},
			},
			'navigate/up': {
				keys: 'up',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView();
				},
			},
			'navigate/select': {
				keys: 'enter',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView().$activeItem;
				},

			},
		};
	}

	defaultCommands() {
		const self = this,
			layoutCommands = super.defaultCommands();

		return {
			... layoutCommands,
			'navigate/down': () => new class NavigateDown extends CommandHookable {
				apply = () => self.getItemsView().activateNextItem();
			},
			'navigate/up': () => new class NavigateUp extends CommandHookable {
				apply = () => self.getItemsView().activateNextItem( true );
			},
			'navigate/select': ( event ) => new class NavigateSelect extends CommandHookable {
				apply = () => self.getItemsView().goToActiveItem( event );
			}( event ),
		};
	}

	getModalLayout() {
		return FinderLayout;
	}

	getItemsView() {
		return this.layout.modalContent.currentView.content.currentView;
	}
}
