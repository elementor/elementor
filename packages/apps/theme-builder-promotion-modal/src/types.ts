export type ThemeBuilderPromotionScenario = 'single_post' | 'single_product' | 'header_footer';

export type ThemeBuilderPromotionConfig = {
	shouldShow: boolean;
	scenario: ThemeBuilderPromotionScenario | null;
	introductionKey: string | null;
};

export type OpenEventDetail = {
	scenario: ThemeBuilderPromotionScenario;
	introductionKey: string;
};

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
