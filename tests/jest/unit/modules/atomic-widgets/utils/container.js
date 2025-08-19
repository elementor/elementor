export function createContainer( {
	elType,
	widgetType,
	label = 'Container',
	id,
	settings = {},
	styles = {},
} = {} ) {
	const settingsModel = createModel( settings );

	const container = {
		id,
		label,
		settings: settingsModel,
		model: createModel( {
			elType,
			widgetType,
			styles,
			settings: settingsModel,
		} ),
		render: jest.fn(),
		lookup: () => container,
	};

	return container;
}

export function addChildToContainer( container, child ) {
	const children = container.model.get( 'elements' )?.models || [];

	children.push( child );

	container.model.set( 'elements', { models: children } );
	container.children = children;

	child.parent = container;
}

function createModel( attributes ) {
	return {
		attributes,
		toJSON() {
			return this.attributes;
		},
		get( key ) {
			return this.attributes[ key ];
		},
		set( key, value ) {
			// Support setting multiple attributes as object at once.
			const valueToMerge = 'object' === typeof key ? key : { [ key ]: value };

			this.attributes = { ...this.attributes, ...valueToMerge };
		},
	};
}

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
