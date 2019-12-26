import elementorModules from '../../../../assets/dev/js/modules/modules';
import ModalLayout from './views/modal/layout';
import Component from './api/modules/component';
import ComponentModal from './api/modules/component-modal';
import HookBreak from './api/modules/hook-break';

elementorModules.common = {
	Component: Component, // TODO: move to `$e.modules.Component`.
	ComponentModal: ComponentModal, // TODO: move to `$e.modules.ComponentModal`.
	HookBreak: HookBreak, // TODO: move to `$e.modules.HookBreak`.
	views: {
		modal: {
			Layout: ModalLayout,
		},
	},
};
