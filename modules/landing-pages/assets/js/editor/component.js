import * as hooks from './hooks/';

export default class LandingPageComponent extends $e.modules.ComponentBase {
	getNamespace() {
		return 'document/landing-page';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
