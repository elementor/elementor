export class Index extends $e.modules.CommandData {
	static getEndpointFormat() {
		return 'presets/{id}';
	}

	apply() {
		// TODO: This is mock data

		return {
			data: {
				data: {
					id: 5,
					settings: {
						title_color: '#888888',
					},
				},
			},
		};
	}
}
