import { type EditMode } from '@elementor/editor-v1-adapters';

type ExtendedWindow = Window & {
	elementor: {
		changeEditMode: () => void;
		channels: {
			dataEditMode: {
				request: ( key: 'activeMode' ) => EditMode;
			};
		};
	};
};

export function mockEditMode( editMode: EditMode ) {
	( window as unknown as ExtendedWindow ).elementor = {
		changeEditMode: () => {},
		channels: {
			dataEditMode: {
				request: () => editMode,
			},
		},
	};
}
