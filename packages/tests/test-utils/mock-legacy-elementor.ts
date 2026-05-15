import type { LegacyWindow } from '@elementor/editor-canvas';

export const mockLegacyElementor = () => {
	const mockBaseView = class {
		getContextMenuGroups() {
			return [];
		}
	};

	const legacyWindow = window as unknown as LegacyWindow;

	legacyWindow.elementor = {
		modules: {
			elements: {
				types: {
					Widget: class {
						getType() {
							return 'widget';
						}

						getView() {
							return mockBaseView;
						}
					},
				},
				views: {
					Widget: mockBaseView,
				},
			},
		},
	} as unknown as LegacyWindow[ 'elementor' ];
};

