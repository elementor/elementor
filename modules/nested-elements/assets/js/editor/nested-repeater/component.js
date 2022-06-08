import NestedModelBase from './models/nested-model-base';
import NestedViewBase from './views/nested-view-base';

import RepeaterControl from './controls/repeater';

import * as hooks from './hooks/';

export default class Component extends $e.modules.ComponentBase {
	exports = {
		NestedModelBase,
		NestedViewBase,
	};

	registerAPI() {
		super.registerAPI();

		elementor.addControlView( 'nested-elements-repeater', RepeaterControl );

		elementor.hooks.addFilter( 'elements/container/contextMenuGroups', this.removeDeleteFromContextMenu.bind( this ) );
	}

	getNamespace() {
		return 'nested-elements/nested-repeater';
	}

	defaultHooks() {
		return this.importHooks( hooks );
	}

	getChildrenTitle( container, index ) {
		const title = container.view.model.config.defaults.elements_title;

		// Translations comes from server side.
		return sprintf( title, index );
	}

	removeDeleteFromContextMenu( groups, view ) {
		// Disabling 'delete' from context menu of building blocks containers.
		const model = view.options.model;

		if ( 'container' === model.get( 'elType' ) &&
			$e.components.get( 'nested-elements' ).isModelParentSupportNesting( model ) ) {
			// Remove the 'delete' item from the container context menu.
			const newValues = [ ... groups ],
				deleteItemIndex = newValues.findIndex( ( item ) => 'delete' === item?.name );

			delete newValues[ deleteItemIndex ];

			groups = newValues;
		}

		return groups;
	}
}
