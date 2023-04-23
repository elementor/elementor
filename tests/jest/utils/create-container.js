export default function createContainer( {
	elType,
	widgetType,
	id,
	isInner = false,
	settings = {},
	controls = {},
 } = {} ) {
	return {
		id,
		settings: {
			controls,
			toJSON: () => ( {
				...settings,
			} ),
		},
		model: {
			attributes: {
				elType,
				widgetType,
				isInner,
			},
			get( key ) {
				return this.attributes[ key ];
			},
		},
	};
}
