import Component from './component';

export default class extends Component {
	getModalLayout() {
		this.forceMethodImplementation( 'getModalLayout' );
	}

	onInit() {
		super.onInit();

		$e.shortcuts.register( 'esc', {
			scopes: [ this.getNamespace() ],
			callback: () => this.close(),
		} );
	}

	defaultCommands() {
		return {
			open: () => $e.route( this.getNamespace() ),
			close: () => this.close(),
			toggle: () => {
				if ( this.isOpen ) {
					this.close();
				} else {
					$e.route( this.getNamespace() );
				}
			},
		};
	}

	defaultRoutes() {
		return {
			'': () => { /* Nothing to do, it's already rendered. */ },
		};
	}

	open() {
		if ( ! this.layout ) {
			const layout = this.getModalLayout();
			this.layout = new layout( { component: this } );

			this.layout.getModal().on( 'hide', () => this.close() );
		}

		this.layout.showModal();

		return true;
	}

	close() {
		if ( ! super.close() ) {
			return false;
		}

		this.layout.getModal().hide();

		return true;
	}
}
