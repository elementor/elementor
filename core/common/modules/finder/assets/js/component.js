import FinderLayout from './modal-layout';

export default class extends elementorModules.common.ComponentModal {
	getNamespace() {
		return 'finder';
	}

	getModalLayout() {
		return FinderLayout;
	}

	defaultCommands() {
		return Object.assign( super.defaultCommands(), {
			'navigate/down': () => this.getItemsView().activateNextItem(),
			'navigate/up': () => this.getItemsView().activateNextItem( true ),
			'navigate/select': ( event ) => this.getItemsView().goToActiveItem( event ),
		} );
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

	getItemsView() {
		return this.layout.modalContent.currentView.content.currentView;
	}
}
