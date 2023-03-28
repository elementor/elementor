export type ProDocument = {
	id: number,
	// Corresponds to the document rendering location from the theme-builder.
	// This might be changed later. Still need to decide on final approach.
	locationKey: string | null,
}

export type ProV1Document = {
	id: number,
	config: {
		theme_builder: {
			settings: {
				location: string,
			}
		}
	},
}

export type ExtendedWindow = Window & {
	elementor: {
		documents: {
			documents: Record<string, ProV1Document>,
			getCurrent: () => ProV1Document,
		}
	}
}
