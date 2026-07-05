import type { EditMode } from '@elementor/editor-v1-adapters';

declare global {
	interface Window {
		elementor: {
			changeEditMode: () => void;
			channels: {
				dataEditMode: {
					request: ( key: 'activeMode' ) => EditMode;
				};
			};
		};
	}
}

export {};
