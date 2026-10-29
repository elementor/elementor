export type PromotionCdnPayload = {
	is_active: boolean;
	message?: string;
	button_text?: string;
	url?: string;
	label?: string;
	title?: string;
	text?: string;
	cta_text?: string;
	cta_url?: string;
	image_url?: string;
	image_alt?: string;
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

export const SIDE_MENU_FIXTURE: PromotionCdnPayload = {
	is_active: true,
	label: 'Playwright side menu upgrade',
	url: 'https://go.elementor.com/playwright-side-menu-fixture/',
};

export const CONVERSION_BANNER_INACTIVE_FIXTURE: PromotionCdnPayload = {
	is_active: false,
};

export const PROMOTION_CDN_INACTIVE_FIXTURE: PromotionCdnPayload = {
	is_active: false,
};

export const CONVERSION_BANNER_FIXTURE: PromotionCdnPayload = {
	is_active: true,
	title: 'Playwright conversion banner title',
	text: 'Playwright conversion banner body copy.',
	cta_text: 'Playwright banner CTA',
	cta_url: 'https://go.elementor.com/playwright-conversion-banner-fixture/',
};

export const THEME_BUILDER_FIXTURE: PromotionCdnPayload = {
	is_active: true,
	button_text: 'Playwright theme builder upgrade',
	url: 'https://go.elementor.com/playwright-theme-builder-fixture/',
};

export const STICKY_PANEL_STICKY_ROOT = '#elementor-panel-get-pro-elements-sticky';

export const ELEMENTOR_APP_THEME_BUILDER_PROMOTION_URL =
	'/wp-admin/admin.php?page=elementor-app#/site-editor/promotion';
