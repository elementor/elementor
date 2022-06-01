export class NestedRepeaterProtectedBuildingBlockContainers extends $e.modules.hookData.Dependency {
	getId() {
		return 'new-nested-repeater-protected-building-block-containers';
	}

	getCommand() {
		return 'document/elements/delete';
	}

	getContainerType() {
		return 'container';
	}

	getConditions( args = {}, result ) {
		if ( ! args.container ) {
			return args.containers.every(
				( container ) => $e.components.get( 'nested-elements' )
					.isWidgetSupportNesting( container.parent.model.get( 'widgetType' ) )
			);
		}

		return false;
	}

	apply() {
		return false;
	}
}
