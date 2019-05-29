import FinderLayout from './modal-layout';

export default class extends elementorModules.Component {
	getNamespace() {
		return 'finder';
	}

	getRoutes() {
		return {
			'': () => {},
		};
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
				scope: [ this.getNamespace() ],
			},
			'navigate/up': {
				keys: 'up',
				scope: [ this.getNamespace() ],
			},
			'navigate/select': {
				keys: 'enter',
				scope: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView().$activeItem;
				},

			},
		};
	}

	open() {
		if ( ! this.layout ) {
			this.layout = new FinderLayout();
			this.layout.getModal().on( 'hide', () => elementorCommon.route.close( this.getNamespace() ) );
		}

		this.layout.showModal();

		return true;
	}

	close() {
		this.layout.getModal().hide();
	}

	getItemsView() {
		return this.layout.modalContent.currentView.content.currentView;
	}
}
