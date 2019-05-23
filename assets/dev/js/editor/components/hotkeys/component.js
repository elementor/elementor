import ModalLayout from './modal-layout';

export default class extends elementorModules.Component {
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
			this.layout.getModal().on( 'hide', () => elementorCommon.route.close( this.getNamespace() ) );
		}

		this.context.layout.showModal();
		return true;
	}
}
