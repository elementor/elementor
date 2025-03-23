import * as hooks from './hooks';
import { AppManager } from "../../../../promotions/assets/js/react/app-manager";

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'document/atomic-widgets';
	}

	defaultHooks() {
		return this.importHooks( hooks );
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
