export type PromotionCdnPayload = {
	is_active: boolean;
	message?: string;
	button_text?: string;
	url?: string;
	label?: string;
};

export const PROMO_CHROME_SELECTORS = [
	'#elementor-panel-get-pro-elements-sticky',
	'#elementor-panel-get-pro-elements',
	'#e-conversion-banner',
	'.e-feature-promotion',
] as const;

export const STICKY_PANEL_CDN_OPTION = 'elementor_sticky_panel_promotion_assets_data';

export const SIDE_MENU_CDN_OPTION = 'elementor_side_menu_assets_data';

export const CONVERSION_BANNER_CDN_OPTION = 'elementor_conversion_banner_assets_data';

export const THEME_BUILDER_CDN_OPTION = 'elementor_theme_builder_promotion_assets_data';

export const STICKY_PANEL_FIXTURE: PromotionCdnPayload = {
	is_active: true,
	message: 'Playwright CDN fixture sticky message.',
	button_text: 'Playwright sticky upgrade',
	url: 'https://go.elementor.com/playwright-sticky-fixture/',
};

export const STICKY_PANEL_STICKY_ROOT = '#elementor-panel-get-pro-elements-sticky';
