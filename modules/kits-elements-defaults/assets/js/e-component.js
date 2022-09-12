import * as hooks from './hooks';
import * as dataCommands from './data-commands/';
import * as commands from './commands/';

export default class EComponent extends $e.modules.ComponentBase {
	registerAPI( ...args ) {
		window.addEventListener( 'elementor/init', async () => {
			// Load default values on init.
			$e.data.cache.storage.removeItem( 'kits-elements-defaults' );

			await $e.data.get( 'kits-elements-defaults/index' );
		} );

		elementor.hooks.addFilter( 'elements/widget/contextMenuGroups', this.addContextMenuItem );

		super.registerAPI( ...args );
	}

	getNamespace() {
		return 'kits-elements-defaults';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	defaultData() {
		return this.importCommands( dataCommands );
	}

	defaultCommands() {
		return this.importCommands( commands );
	}

	addContextMenuItem( groups, view ) {
		return groups.map( ( group ) => {
			if ( group.name !== 'save' ) {
				return group;
			}

			group.actions = [
				...group.actions,
				{
					name: 'save-as-default',
					title: __( 'Save as Default', 'elementor' ),
					isEnabled: () => elementor.config?.user?.is_administrator,
					callback: () => $e.run( 'kits-elements-defaults/create', { container: view.getContainer() } ),
				},
			];

			return group;
		} );
	}
}
