export function setGlobalContainers( containers = [] ) {
	const containersMap = containers.reduce(
		( obj, container ) => ( {
			...obj,
			[ container.id ]: container,
		} ),
		{},
	);

	global.elementor = {
		...global.elementor,
		getContainer: ( id ) => containersMap[ id ] ?? null,
	};
}

