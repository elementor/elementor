import { type EditMode } from '@elementor/editor-v1-adapters';

export function mockEditMode( editMode: EditMode ) {
	window.elementor = {
		changeEditMode: () => {},
		channels: {
			dataEditMode: {
				request: () => editMode,
			},
		},
	};
}
