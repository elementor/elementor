import elementorModules from '../../../../assets/dev/js/modules/modules';
import ModalLayout from './views/modal/layout';
import Component from './api/modules/component';
import ComponentModal from './api/modules/component-modal';
import HookBreak from './api/modules/hook-break';

elementorModules.common = {
	Component: Component,
	ComponentModal: ComponentModal,
	HookBreak: HookBreak,
	views: {
		modal: {
			Layout: ModalLayout,
		},
	},
};
