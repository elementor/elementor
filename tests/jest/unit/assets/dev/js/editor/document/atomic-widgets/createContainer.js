export default function createContainer( {
	elType,
	widgetType,
	id,
	settings = {},
	styles = {},
} = {} ) {
	const createModel = ( attributes ) => ( {
		attributes,
		get( key ) {
			return this.attributes[ key ];
		},
		set( key, value ) {
			this.attributes[ key ] = value;
		},
	} );

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
