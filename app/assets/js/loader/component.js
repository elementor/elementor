import ComponentModalBase from 'elementor-api/modules/component-base';
import * as commands from './commands/';

export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'app';
	}

	defaultRoutes() {
		return {
			'': ( args ) => {
				args.url = args.url || elementorAppConfig.menu_url;

				$e.run( 'app/load', args );

				this.iframe.style.display = '';
				document.body.style.overflow = 'hidden';
			},
		};
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	defaultShortcuts() {
		return {
			'': {
				keys: 'ctrl+shift+e',
			},
			close: {
				keys: 'esc',
				scopes: [ this.getNamespace() ],
			},
		};
	}
}
