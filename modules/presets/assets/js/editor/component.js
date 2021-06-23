import * as commands from './commands/index';
import * as dataCommands from './commands-data/index';

export default class Component extends $e.modules.ComponentBase {
	getNamespace() {
		return 'presets';
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
			() => {
				const ids = [
					...elementor.config.presets.active_ids,
					...elementor.config.presets.default_ids,
				];

				if ( ! ids.length ) {
					return Promise.resolve();
				}

				return $e.data.get( 'presets/index', { ids } );
			},
		] );
	}
}
