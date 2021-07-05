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

		elementorCommon.elements.$window.on( 'elementor:loaded', () => {
			$e.data.deleteCache( this, 'default-values/index' );
		} );

		elementor.hooks.addFilter( 'editor/attach-preview/before', ( callbacks ) => [
			...callbacks,
			() => $e.data.get( 'default-values/index', {}, {} ),
		] );

		elementor.hooks.addFilter( 'editor/controls/base/default-value', ( defaultValue, control, settings ) => {
			const type = settings.attributes.widgetType || settings.attributes.elType;

			if ( ! type ) {
				return defaultValue;
			}

			const dynamicDefaults = $e.data.getCache( this, `default-values/${ type }` );

			if ( ! dynamicDefaults || ! dynamicDefaults[ control.name ] ) {
				return defaultValue;
			}

			return dynamicDefaults[ control.name ];
		} );
	}
}
