import elementorModules from 'elementor-assets-js/modules/modules';
import ModalLayout from './views/modal/layout';

elementorModules.common = {
	views: {
		modal: {
			Layout: ModalLayout,
		},
	},
};
