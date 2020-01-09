import ComponentModal from 'elementor-common/components/component-modal';
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
