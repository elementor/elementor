import FinderLayout from './modal-layout';

export default class extends elementorModules.Component {
	__construct( args ) {
		super.__construct( args );

		this.isModal = true;
	}

	getNamespace() {
		return 'finder';
	}

	getRoutes() {
		return {
			'': () => { /* Nothing to do, it's already rendered. */ },
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
