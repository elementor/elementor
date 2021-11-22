export class NestedRepeaterSelectNewInsertedTab extends ( $e.modules.hookUI.After ) {
	getId() {
		return 'nested-repeater-select-new-inserted-tab';
	}

	getCommand() {
		return 'document/repeater/insert';
	}

	getContainerType() {
		return 'widget';
	}

	getConditions( args ) {
		return elementor.modules.nestedElements.isWidgetSupportNesting( args.name );
	}

	apply( args ) {
		const { containers = [ args.container ] } = args;

		containers.forEach( ( container ) => {
			// Select new created nested container
			$e.run( 'nested-elements/nested-repeater/select', {
				index: container.repeaters[ args.name ].children.length,
				container: container,
			} );
		} );
	}
}

export default NestedRepeaterSelectNewInsertedTab;
