import elementorModules from '../../../../assets/dev/js/modules/modules';
import ModalLayout from './views/modal/layout';
import Component from './components/component';
import ComponentModal from './components/component-modal';

elementorModules.common = {
	Component: Component,
	ComponentModal: ComponentModal,
	views: {
		modal: {
			Layout: ModalLayout,
		},
	},
};
