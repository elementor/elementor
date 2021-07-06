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

		elementor.hooks.addFilter( 'editor/before-on-start', ( callbacks ) => [
			...callbacks,
			() => {
				$e.data.deleteCache( this, 'default-values/index' );

				return $e.data.get( 'default-values/index', {}, {} );
			},
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

		elementor.hooks.addFilter( 'editor/widgets-cache', ( widgets ) => {
			const dynamicDefaultValues = $e.data.getCache( this, `default-values` );

			Object.entries( dynamicDefaultValues ).forEach( ( [ widgetKey, controlsValues ] ) => {
				if ( ! controlsValues.__globals__ || ! widgets[ widgetKey ] ) {
					return;
				}

				Object.entries( controlsValues.__globals__ ).forEach( ( [ controlKey, value ] ) => {
					if ( ! widgets[ widgetKey ].controls[ controlKey ] ) {
						return;
					}

					widgets[ widgetKey ].controls[ controlKey ].global.default = value;
				} );
			} );

			return widgets;
		} );
	}
}
