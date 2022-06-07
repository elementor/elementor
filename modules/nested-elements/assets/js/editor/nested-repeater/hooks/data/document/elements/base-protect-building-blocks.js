export class BaseProtectBuildingBlocks extends $e.modules.hookData.Dependency {
	getConditions( args = {} ) {
		const containers = args.containers || [ args.container ];

		return containers.some(
			( container ) => $e.components.get( 'nested-elements' )
				.isWidgetSupportNesting( container.parent.model.get( 'widgetType' ) )
		);
	}

	apply() {
		return false; // throws `$e.modules.HookBreak`.
	}
}
