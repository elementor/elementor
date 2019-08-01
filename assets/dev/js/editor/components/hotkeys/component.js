import ModalLayout from './modal-layout';

export default class extends elementorModules.ComponentModal {
	getNamespace() {
		return 'shortcuts';
	}

	getModalLayout() {
		return ModalLayout;
	}

	getShortcuts() {
		return {
			'': {
				keys: 'ctrl+?',
			},
		};
	}
}
