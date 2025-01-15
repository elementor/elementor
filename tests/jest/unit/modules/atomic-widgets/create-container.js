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
		elType,
		widgetType,
		type: elType,
		settings: settingsModel,
		model: createModel( {
			elType,
			widgetType,
			styles,
			settings: settingsModel,
		} ),
		render: jest.fn(),
		lookup: () => container,
		view: {
			_index: 0,
		},
	};
	return container;
}

export function addChildToContainer( container, child ) {
	const children = container.model.get( 'elements' )?.models || [];
	const childIndex = children.length;

	children.push( child );

	container.model.set( 'elements', { models: children } );
	container.children = children;

	child.parent = container;
	child.view._index = childIndex;
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

