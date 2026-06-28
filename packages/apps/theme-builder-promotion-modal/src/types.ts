export type ThemeBuilderPromotionScenario = 'single_post' | 'single_product' | 'header_footer';

export type ThemeBuilderPromotionConfig = {
	scenario: ThemeBuilderPromotionScenario;
	introductionKey: string | null;
	assets: { title: string; body: string; imageUrl: string };
};

export type OpenEventDetail = ThemeBuilderPromotionConfig;

type ElementorCommonAjax = {
	addRequest: ( action: string, options: { data?: Record< string, unknown > } ) => Promise< unknown >;
};

export type ElementorCommon = {
	ajax?: ElementorCommonAjax;
	eventsManager?: {
		dispatchEvent?: ( name: string, payload: Record< string, unknown > ) => void;
	};
	config?: {
		home_url?: string;
		urls?: {
			assets?: string;
		};
		isRTL?: boolean;
	};
};

export type ExtendedWindow = Window & {
	elementorCommon?: ElementorCommon;
	elementor?: {
		config?: {
			document?: {
				themeBuilderPromotion?: ThemeBuilderPromotionConfig;
			};
			user?: {
				introduction?: Record< string, boolean >;
			};
		};
	};
	$e?: {
		run?: ( command: string ) => unknown;
	};
};
