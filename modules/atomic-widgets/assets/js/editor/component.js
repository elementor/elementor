import * as hooks from './hooks';
import { AppManager } from "../../../../promotions/assets/js/react/app-manager";

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'document/atomic-widgets';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
