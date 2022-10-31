export default function createContainer( {
	elType,
	widgetType,
	id,
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
			get: ( key ) => {
				const map = {
					elType,
					widgetType,
				};

				return map[ key ];
			},
		},
	};
}
