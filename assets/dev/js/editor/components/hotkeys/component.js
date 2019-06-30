import ModalLayout from './modal-layout';

export default class extends elementorModules.Component {
	__construct( args ) {
		super.__construct( args );

		this.isModal = true;
	}

	getNamespace() {
		return 'shortcuts';
	}

	getRoutes() {
		return {
			'': () => {},
		};
	}

	getShortcuts() {
		return {
			'': {
				keys: 'ctrl+?',
			},
		};
	}

	open() {
		if ( ! this.layout ) {
			this.layout = new ModalLayout();
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
