export const AtomicWidgetsSelectors = {
	heading: {
		base: '.e-heading-base',
		widget: '[data-widget_type="e-heading.default"]',
	},
	button: {
		base: '.e-button-base',
		widget: '[data-widget_type="e-button.default"]',
	},
	paragraph: {
		base: '.e-paragraph-base',
		widget: '[data-widget_type="e-paragraph.default"]',
	},
	image: {
		base: '.e-image-base',
		widget: '[data-widget_type="e-image.default"]',
	},
	divider: {
		base: '.e-divider-base',
		widget: '[data-widget_type="e-divider.default"]',
	},
	svg: {
		base: '.e-svg-base',
		widget: '[data-widget_type="e-svg.default"]',
	},
	youtube: {
		base: '.e-youtube-base',
		widget: '[data-widget_type="e-youtube.default"]',
	},
} as const;

