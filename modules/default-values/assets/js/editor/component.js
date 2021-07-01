import * as commands from './commands/index';
import * as dataCommands from './commands-data/index';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'default-values';
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultData() {
		return this.importCommands( dataCommands );
	}

	__construct( args = {} ) {
		super.__construct( args );

		elementor.hooks.addFilter( 'editor/attach-preview/before', ( callbacks ) => [
			...callbacks,
			() => $e.data.get( 'default-values/index', { refresh: true } ),
		] );
	}
}
