import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import * as commands from './commands/';

export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'checklist';
	}

	defaultCommands() {
		const modalCommands = super.defaultCommands();

		return {
			togglePopup: () => {
				elementorDevTools.deprecation.deprecated(
					"$e.run( 'checklist/toggle-popup' )",
					'3.0.0',
					"$e.run( 'checklist/toggle-popup' )",
				);

				// $e.run( 'checklist/toggle-popup' );
			},
			toggleIcon: () => {
				elementorDevTools.deprecation.deprecated(
					"$e.run( 'checklist/toggle-icon' )",
					'3.0.0',
					"$e.run( 'checklist/toggle-icon' )",
				);

				// $e.run( 'checklist/toggle-icon' );
			},

			... modalCommands,
			... this.importCommands( commands ),
		};
	}
}
