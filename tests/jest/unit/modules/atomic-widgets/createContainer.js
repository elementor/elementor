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
			if ( 'object' === typeof key ) {
				Object.entries( key ).forEach( ( [ k, v ] ) => {
					this.set( k, v );
				} );
				return;
			}
			this.attributes[ key ] = value;
		},
	};
}
