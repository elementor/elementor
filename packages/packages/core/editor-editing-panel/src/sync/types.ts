import { type ControlItem, type V1Element } from '@elementor/editor-elements';
import { type PropsSchema } from '@elementor/editor-props';

import { type DynamicTag, type DynamicTags, type DynamicTagsManager } from '../dynamics/types';

export type SupportedFonts = 'system' | 'googlefonts' | 'custom';

type EnqueueFont = ( fontFamily: string, context?: 'preview' | 'editor' ) => void;

export type ExtendedWindow = Window & {
	elementor?: {
		config?: {
			controls?: {
				font?: {
					options?: Record< string, SupportedFonts >;
				};
			};
			atomicDynamicTags?: {
				tags: DynamicTags;
				groups: Record< DynamicTag[ 'group' ], { title: string } >;
			};
		};
		dynamicTags?: DynamicTagsManager;
		selection?: {
			getElements: () => V1Element[];
		};
		widgetsCache?: Record<
			string,
			{
				atomic_controls?: ControlItem[];
				atomic_props_schema?: PropsSchema;
				controls: object;
				title: string;
			}
		>;
		getContainer?: ( id: string ) => V1Element;
		helpers?: {
			enqueueFont: EnqueueFont;
		};
	};
	elementorCommon?: {
		config?: {
			experimentalFeatures?: Record< string, boolean >;
		};
	};
	elementorFrontend?: {
		config?: {
			is_rtl?: boolean;
		};
	};
};
