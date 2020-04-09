import ComponentModalBase from 'elementor-api/modules/component-modal-base';
import FinderLayout from './modal/views/layout';
import * as commands from './commands/';

export default class Component extends ComponentModalBase {
	getNamespace() {
		return 'finder';
	}

	defaultShortcuts() {
		return {
			'': {
				keys: 'ctrl+e',
			},
			'navigate-down': {
				keys: 'down',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView();
				},
			},
			'navigate-up': {
				keys: 'up',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView();
				},
			},
			'navigate-select': {
				keys: 'enter',
				scopes: [ this.getNamespace() ],
				dependency: () => {
					return this.getItemsView().$activeItem;
				},

			},
		};
	}

	defaultCommands() {
		const modalCommands = super.defaultCommands();

		return {
			'navigate/down': () => {
				elementorCommon.helpers.softDeprecated(
					"$e.run( 'finder/navigate/down' )",
					'3.0.0',
					"$e.run( 'finder/navigate-down' )"
				);

				$e.run( 'finder/navigate-down' );
			},
			'navigate/up': () => {
				elementorCommon.helpers.softDeprecated(
					"$e.run( 'finder/navigate/up' )",
					'3.0.0',
					"$e.run( 'finder/navigate-up' )"
				);

				$e.run( 'finder/navigate-up' );
			},
			'navigate/select': ( event ) => {
				elementorCommon.helpers.softDeprecated(
					"$e.run( 'finder/navigate/select', event )",
					'3.0.0',
					"$e.run( 'finder/navigate-select', event )"
				);

				// TODO: Fix $e.shortcuts use args. ( args.event ).
				$e.run( 'finder/navigate-select', event );
			},

			... modalCommands,
			... this.importCommands( commands ),
		};
	}

	getModalLayout() {
		return FinderLayout;
	}

	getItemsView() {
		return this.layout.modalContent.currentView.content.currentView;
	}
}
