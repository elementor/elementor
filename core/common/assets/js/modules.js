import elementorModules from 'elementor-assets-js/modules/modules';
import ModalLayout from './views/modal/layout';
import ComponentBase from 'elementor-api/modules/component-base';
import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import HookBreak from 'elementor-api/modules/hook-break';

elementorModules.common = {
	get Component() {
		// `elementorCommon` isn't available during it self initialize.
		setTimeout( () => {
			elementorCommon.helpers.softDeprecated( 'elementorModules.common.Component', '2.9.0',
				'$e.modules.ComponentBase' );
		}, 2000 );
		return ComponentBase;
	},

	get ComponentModal() {
		// `elementorCommon` isn't available during it self initialize.
		setTimeout( () => {
			elementorCommon.helpers.softDeprecated( 'elementorModules.common.ComponentModal', '2.9.0',
				'$e.modules.ComponentModalBase' );
		}, 2000 );
		return ComponentModalBase;
	},

	get HookBreak() {
		// `elementorCommon` isn't available during it self initialize.
		setTimeout( () => {
			elementorCommon.helpers.softDeprecated( 'elementorModules.common.HookBreak', '2.9.0',
				'$e.modules.HookBreak' );
		}, 2000 );
		return HookBreak;
	},

	views: {
		modal: {
			Layout: ModalLayout,
		},
	},
};
