import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import ModalLayout from './modal-layout';

export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'shortcuts';
	}

	defaultShortcuts() {
		return {
			'': {
				keys: 'ctrl+?, shift+?',
				exclude: [ 'input' ],
			},
		};
	}

	getModalLayout() {
		return ModalLayout;
	}
}
