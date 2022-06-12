export class NestedRepeaterPreventMovingBuildingBlockContainers extends $e.modules.hookData.Dependency {
	getId() {
		return 'nested-repeater-prevent-moving-building-block-containers';
	}

	getCommand() {
		return 'document/elements/move';
	}

	getConditions( args = {} ) {
		const containers = args.containers || [ args.container ];

		return containers.some(
			( container ) => $e.components.get( 'nested-elements' )
				.isWidgetSupportNesting( container.parent.model.get( 'widgetType' ) ) &&
				container.parent.id !== args.target.id
		);
	}

	apply() {
		return false; // throws `$e.modules.HookBreak`.
	}
}
