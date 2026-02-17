import type { InteractionsConfig, DynamicTags, DynamicTagsManager, DynamicTag } from '@elementor/editor-editing-panel';
import type { ControlItem, V1Element } from '@elementor/editor-elements';
import type { PropsSchema } from '@elementor/editor-props';
import type { SupportedFonts, EnqueueFont } from '@elementor/editor-v1-adapters';
import type { V4PromotionData, V4PromotionKey } from '@elementor/editor-controls';

interface EOnboardingConfig {
	version: string;
	restUrl: string;
	nonce: string;
	progress: {
		current_step_id?: string;
		current_step_index?: number;
		completed_steps?: string[];
		exit_type?: 'user_exit' | 'unexpected' | null;
		last_active_timestamp?: number | null;
		started_at?: number | null;
		completed_at?: number | null;
	};
	choices: {
		building_for?: string | null;
		site_about?: string[];
		experience_level?: string | null;
		theme_selection?: string | null;
		site_features?: string[];
	};
	hadUnexpectedExit: boolean;
	isConnected: boolean;
	hasProSubscription?: boolean;
	userName?: string;
	uiTheme?: 'auto' | 'dark' | 'light';
	steps: Array<{
		id: string;
		label: string;
		type: 'single' | 'multiple';
	}>;
	urls: {
		dashboard: string;
		editor: string;
		connect: string;
	};
}

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
				};
			};
			config?: {
				experimentalFeatures?: Record< string, boolean >;
				urls?: {
					assets?: string;
				};
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
		elementorAppConfig?: {
			'e-onboarding'?: EOnboardingConfig;
		};
		ElementorInteractionsConfig?: InteractionsConfig;
		ElementorVariablesQuotaConfig?: Record< string, number >;
		ElementorVariablesQuotaConfigExtended?: Record< string, number >;
	}
}

export {};
