import type { InteractionsConfig, DynamicTags, DynamicTagsManager, DynamicTag } from '@elementor/editor-editing-panel';
import type { ControlItem, V1Element } from '@elementor/editor-elements';
import type { PropsSchema } from '@elementor/editor-props';
import type { SupportedFonts, EnqueueFont } from '@elementor/editor-v1-adapters';
import type { V4PromotionData, V4PromotionKey } from '@elementor/editor-controls';

declare global {
	interface Window {
		elementorCommon?: {
		eventsManager?: {
			dispatchEvent?: (name: string, data: unknown) => void;
			config?: {
				locations?: Record<string, string>;
				secondaryLocations?: Record<string, string>;
				names?: Record<string, Record<string, string>>;
				triggers?: Record<string, string>;
				elements?: Record<string, string>;
				appTypes?: Record<string, string>;
				targetTypes?: Record<string, string>;
				interactionResults?: Record<string, string>;
				targetNames?: Record<string, Record<string, string>>;
			};
		};
			config?: {
				experimentalFeatures?: Record< string, boolean >;
			};
		};
		elementor?: {
			$preview?: [ HTMLIFrameElement ];
			selection?: {
				getElements: () => V1Element[];
			};
			getContainer?: (id: string) => V1Element | undefined;
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
				v4Promotions?: Record< V4PromotionKey, V4PromotionData >;
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
				enqueueFont?: EnqueueFont;
			};
		};
		elementorFrontend?: {
			config?: {
				is_rtl?: boolean;
			};
		};
		elementorPro?: {
			config?: {
				version?: string;
			};
		};
		ElementorInteractionsConfig?: InteractionsConfig;
		ElementorVariablesQuotaConfig?: Record< string, number >;
		ElementorVariablesQuotaConfigExtended?: Record< string, number >;
	}
}

export {};
