export default class extends elementorModules.Component {
	constructor( ...args ) {
		super( ...args );

		this.title = 'Finder';
		this.namespace = 'finder';
	}

	init( args ) {
		super.init( args );

		this.parent.layout.getModal().on( 'hide', () => elementorCommon.route.close( this.namespace ) );
	}

	getRoutes() {
		return {
			'': () => {},
		};
	}

	getItemsView() {
		return this.parent.layout.modalContent.currentView.content.currentView;
	}

	getCommands() {
		return {
			'navigate/down': () => this.getItemsView().activateNextItem(),
			'navigate/up': () => this.getItemsView().activateNextItem( true ),
			'navigate/select': () => ( event ) => this.getItemsView().goToActiveItem( event ),
		};
	}

	open() {
		this.parent.layout.showModal();
		return true;
	}

	getShortcuts() {
		return {
			'': {
				keys: 'ctrl+e',
			},
			'navigate/down': {
				keys: 'down',
				scope: [ this.namespace ],
			},
			'navigate/up': {
				keys: 'up',
				scope: [ this.namespace ],
			},
			'navigate/select': {
				keys: 'enter',
				scope: [ this.namespace ],
				dependency: () => {
					return this.getItemsView().$activeItem;
				},

			},
		};
	}
}
