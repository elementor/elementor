import ModalLayout from './modal-layout';

export default class extends elementorModules.common.ComponentModal {
	getNamespace() {
		return 'shortcuts';
	}

	getModalLayout() {
		return ModalLayout;
	}

	defaultShortcuts() {
		return {
			'': {
				keys: 'ctrl+?',
			},
		};
	}
}
