import FinderLayout from './modal-layout';

export default class extends elementorModules.ComponentModal {
	getNamespace() {
		return 'finder';
	}

	getModalLayout() {
		return FinderLayout;
	}

	getCommands() {
		return {
			'navigate/down': () => this.getItemsView().activateNextItem(),
			'navigate/up': () => this.getItemsView().activateNextItem( true ),
			'navigate/select': () => ( event ) => this.getItemsView().goToActiveItem( event ),
		};
	}

	getShortcuts() {
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
