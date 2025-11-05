import { type ControlItem, type V1Element } from '@elementor/editor-elements';
import { type PropsSchema } from '@elementor/editor-props';

export type SupportedFonts = 'system' | 'googlefonts' | 'custom';

type EnqueueFont = ( fontFamily: string, context?: 'preview' | 'editor' ) => void;

export type ExtendedWindow = Window & {
	elementor?: {
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
		config?: {
			controls?: {
				font?: {
					options?: Record< string, SupportedFonts >;
				};
			};
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
