export default function createContainer( {
	elType,
	widgetType,
	label = 'Container',
	id,
	settings = {},
	styles = {},
} = {} ) {
	const settingsModel = createModel( settings );

	return {
		id,
		label,
		settings: settingsModel,
		model: createModel( {
			elType,
			widgetType,
			styles,
			settings: settingsModel,
		} ),
	};
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
