import * as hooks from './hooks/';

export default class LinksPageComponent extends $e.modules.ComponentBase {
	getNamespace() {
		return 'document/contact-buttons';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}
}
