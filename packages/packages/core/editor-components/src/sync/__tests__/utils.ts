import { type V1ElementData } from '@elementor/editor-elements';

export const createMockContainer = ( elements: V1ElementData[] = [] ) => ( {
	model: {
		get: () => ( {
			toJSON: () => elements,
		} ),
	},
} );
