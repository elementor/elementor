export type EditorPromotionCdnEndpoint = {
	jsonKey: string;
	path: string;
	activeUrlFields: readonly string[];
	activeStringFieldsWhenActive: readonly string[];
};

export const EDITOR_PROMOTIONS_CDN_BASE_URL = 'https://assets.elementor.com/editor-promotions/v1';

export const EDITOR_PROMOTION_CDN_ENDPOINTS: readonly EditorPromotionCdnEndpoint[] = [
	{
		jsonKey: 'sticky-panel',
		path: 'sticky-panel.json',
		activeUrlFields: [ 'url' ],
		activeStringFieldsWhenActive: [ 'message', 'button_text' ],
	},
	{
		jsonKey: 'side-menu',
		path: 'side-menu.json',
		activeUrlFields: [ 'url' ],
		activeStringFieldsWhenActive: [ 'label' ],
	},
	{
		jsonKey: 'conversion-banner',
		path: 'conversion-banner.json',
		activeUrlFields: [ 'cta_url', 'image_url' ],
		activeStringFieldsWhenActive: [ 'title', 'text', 'cta_text' ],
	},
	{
		jsonKey: 'theme-builder',
		path: 'theme-builder.json',
		activeUrlFields: [ 'url' ],
		activeStringFieldsWhenActive: [ 'button_text' ],
	},
	{
		jsonKey: 'pointer',
		path: 'pointer.json',
		activeUrlFields: [ 'cta_url' ],
		activeStringFieldsWhenActive: [ 'title' ],
	},
	{
		jsonKey: 'connect-page',
		path: 'connect-page.json',
		activeUrlFields: [ 'cta_url', 'image_url' ],
		activeStringFieldsWhenActive: [ 'title', 'text', 'cta_text' ],
	},
	{
		jsonKey: 'plugins-page',
		path: 'plugins-page.json',
		activeUrlFields: [ 'url' ],
		activeStringFieldsWhenActive: [ 'label' ],
	},
] as const;

export const EDITOR_PROMOTION_CDN_FETCH_TIMEOUT_MS = 15_000;
