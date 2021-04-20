import { TaxonomiesIndex } from './commands/taxonimies-index';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'kit-taxonomies';
	}

	defaultData() {
		return this.importCommands( {
			index: TaxonomiesIndex,
		} );
	}
}
