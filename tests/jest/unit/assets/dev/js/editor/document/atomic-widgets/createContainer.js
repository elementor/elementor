export default function createContainer( {
	elType,
	widgetType,
	id,
	settings = {},
	styles = {},
} = {} ) {
	const settingsModel = createModel( settings );

	return {
		id,
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
			this.attributes[ key ] = value;
		},
	};
}
