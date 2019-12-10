import elementorModules from '../../../../assets/dev/js/modules/modules';
import ModalLayout from './views/modal/layout';
import Component from './components/component';
import ComponentModal from './components/component-modal';
import HookBreak from './components/hook-break';

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
