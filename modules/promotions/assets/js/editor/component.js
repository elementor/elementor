import { AppManager } from '../react/app-manager';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'promotions';
	}

	defaultCommands() {
		return {
			alphachip: ( args ) => {
				const PopupManager = new AppManager();
				PopupManager.mount( args.event.target, args.selectors );
			},
		};
	}
}
