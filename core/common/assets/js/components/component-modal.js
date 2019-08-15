import Component from './component';

export default class extends Component {
	getModalLayout() {
		throw Error( 'getModalLayout must be override.' );
	}

	onInit() {
		super.onInit();

		elementorCommon.shortcuts.register( 'esc', {
			scopes: [ this.getNamespace() ],
			callback: () => this.close(),
		} );
	}

	getRoutes() {
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
