import ComponentModal from 'elementor-api/modules/component-modal';
import ModalLayout from './modal-layout';

export default class Component extends ComponentModal {
	getNamespace() {
		return 'shortcuts';
	}

	defaultShortcuts() {
		return {
			'': {
				keys: 'ctrl+?',
			},
		};
	}

	getModalLayout() {
		return ModalLayout;
	}
}
