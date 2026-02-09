import type { PropType } from '@elementor/editor-props';

type ExtendedWindow = {
	elementor: {
		config: {
			atomic?: {
				interactions_schema: Record< string, PropType< { key?: string } > >;
			};
		};
	};
};

export const getInteractionSchema = () => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor.config.atomic?.interactions_schema ?? {};
};
