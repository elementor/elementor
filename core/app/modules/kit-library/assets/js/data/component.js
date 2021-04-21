import { Index, KitsFavorites } from './commands';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'kits';
	}

	defaultData() {
		return this.importCommands( {
			index: Index,
			favorites: KitsFavorites,
		} );
	}
}
