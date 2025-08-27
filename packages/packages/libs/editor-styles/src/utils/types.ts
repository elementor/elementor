import { type PropType } from '@elementor/editor-props';

export type ExtendedWindow = Window & {
	elementor: {
		config: {
			atomic?: {
				styles_schema: Record< string, PropType >;
			};
		};
	};
};
