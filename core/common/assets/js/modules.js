import elementorModules from '../../../../assets/dev/js/modules/modules';
import ModalLayout from './views/modal/layout';
import Component from './api/modules/component-base';
import ComponentModal from './api/modules/component-modal';
import HookBreak from './api/modules/hook-break';

elementorModules.common = {
	Component: Component, // TODO: remove use `$e.modules.ComponentBase`.
	ComponentModal: ComponentModal, // TODO: remove use `$e.modules.ComponentModal`.
	HookBreak: HookBreak, // TODO: remove use `$e.modules.HookBreak`.
	views: {
		modal: {
			Layout: ModalLayout,
		},
	},
};
