import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import * as commands from './commands/';

export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'checklist';
	}

	defaultCommands() {
		const modalCommands = super.defaultCommands();

		return {
			toggle: () => {
				elementorDevTools.deprecation.deprecated(
					"$e.run( 'checklist/toggle' )",
					'3.0.0',
					"$e.run( 'checklist/toggle' )",
				);

				$e.run( 'checklist/toggle' );
			},

			... modalCommands,
			... this.importCommands( commands ),
		};
	}
}
