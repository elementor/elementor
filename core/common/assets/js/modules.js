import elementorModules from 'elementor-assets-js/modules/modules';
import ModalLayout from './views/modal/layout';
import ComponentBase from './api/modules/component-base';
import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import HookBreak from './api/modules/hook-break';

elementorModules.common = {
	get Component() {
		setTimeout( () => {
			elementorCommon.helpers.softDeprecated( 'elementorModules.common.Component', '2.9.0',
				'$e.modules.ComponentBase' );
		} );
		return ComponentBase;
	},

	get ComponentModal() {
		setTimeout( () => {
			elementorCommon.helpers.softDeprecated( 'elementorModules.common.ComponentModal', '2.9.0',
				'$e.modules.ComponentModalBase' );
		} );
		return ComponentModalBase;
	},

	get HookBreak() {
		setTimeout( () => {
			elementorCommon.helpers.softDeprecated( 'elementorModules.common.HookBreak', '2.9.0',
				'$e.modules.HookBreak' );
		} );
		return HookBreak;
	},

	views: {
		modal: {
			Layout: ModalLayout,
		},
	},
};
