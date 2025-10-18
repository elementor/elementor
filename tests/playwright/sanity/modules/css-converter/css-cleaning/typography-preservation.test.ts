import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.WP_BASE_URL || 'http://elementor.local:10003';
const WIDGET_CONVERTER_ENDPOINT = `${API_BASE_URL}/wp-json/elementor/v2/widget-converter`;

test.describe('CSS Cleaning - Typography Preservation', () => {
	test('should preserve font properties from oboxthemes.com selector', async ({ request }) => {
		const response = await request.post(WIDGET_CONVERTER_ENDPOINT, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		});

		expect(response.ok()).toBeTruthy();
		const data = await response.json();

		expect(data.success).toBe(true);
		expect(data.widgets_created).toBeGreaterThan(0);

		const postId = data.post_id;
		expect(postId).toBeDefined();

		const metaResponse = await request.get(
			`${API_BASE_URL}/wp-json/wp/v2/posts/${postId}?context=edit`
		);
		expect(metaResponse.ok()).toBeTruthy();
		const postData = await metaResponse.json();

		const elementorData = JSON.parse(postData.meta._elementor_data || '[]');
		expect(elementorData.length).toBeGreaterThan(0);

		const widgets = extractAllWidgets(elementorData);
		expect(widgets.length).toBeGreaterThan(0);

		const paragraphWidgets = widgets.filter((w) => 'e-paragraph' === w.widgetType);
		expect(paragraphWidgets.length).toBeGreaterThan(0);

		const hasCorrectTypography = paragraphWidgets.some((widget) => {
			const styles = widget.styles || {};
			const typography = extractTypographyFromStyles(styles);

			return (
				typography.fontFamily &&
				typography.fontFamily.includes('freight-text-pro') &&
				!typography.fontFamily.includes('0,') &&
				typography.fontSize &&
				'26px' === typography.fontSize &&
				typography.fontWeight &&
				'400' === typography.fontWeight &&
				typography.lineHeight &&
				'36px' === typography.lineHeight
			);
		});

		expect(hasCorrectTypography).toBe(true);
	});

	test('should preserve Elementor global color variables', async ({ request }) => {
		const response = await request.post(WIDGET_CONVERTER_ENDPOINT, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		});

		expect(response.ok()).toBeTruthy();
		const data = await response.json();

		expect(data.success).toBe(true);

		const postId = data.post_id;
		const metaResponse = await request.get(
			`${API_BASE_URL}/wp-json/wp/v2/posts/${postId}?context=edit`
		);
		const postData = await metaResponse.json();
		const elementorData = JSON.parse(postData.meta._elementor_data || '[]');

		const widgets = extractAllWidgets(elementorData);
		const paragraphWidgets = widgets.filter((w) => 'e-paragraph' === w.widgetType);

		const hasGlobalColorVariable = paragraphWidgets.some((widget) => {
			const styles = widget.styles || {};
			const color = extractColorFromStyles(styles);

			return color && color.includes('--e-global-color-');
		});

		expect(hasGlobalColorVariable).toBe(true);
	});

	test('should not replace var() with 0 in font-family', async ({ request }) => {
		const response = await request.post(WIDGET_CONVERTER_ENDPOINT, {
			data: {
				type: 'url',
				content: 'https://oboxthemes.com/',
				selector: '.elementor-element-6d397c1',
			},
		});

		expect(response.ok()).toBeTruthy();
		const data = await response.json();

		const postId = data.post_id;
		const metaResponse = await request.get(
			`${API_BASE_URL}/wp-json/wp/v2/posts/${postId}?context=edit`
		);
		const postData = await metaResponse.json();
		const elementorData = JSON.parse(postData.meta._elementor_data || '[]');

		const widgets = extractAllWidgets(elementorData);

		const hasBrokenFontFamily = widgets.some((widget) => {
			const styles = widget.styles || {};
			const typography = extractTypographyFromStyles(styles);

			return (
				typography.fontFamily &&
				(typography.fontFamily.includes('0,') ||
					typography.fontFamily.includes('0, Sans-serif'))
			);
		});

		expect(hasBrokenFontFamily).toBe(false);
	});

	test('should preserve calc() expressions in layout properties', async ({ request }) => {
		const response = await request.post(WIDGET_CONVERTER_ENDPOINT, {
			data: {
				type: 'html',
				content: `
					<style>
						.test-calc {
							margin: calc(100% - 20px);
							width: calc(50% + 10px);
						}
					</style>
					<div class="test-calc">Test content</div>
				`,
			},
		});

		expect(response.ok()).toBeTruthy();
		const data = await response.json();

		expect(data.success).toBe(true);

		const postId = data.post_id;
		const metaResponse = await request.get(
			`${API_BASE_URL}/wp-json/wp/v2/posts/${postId}?context=edit`
		);
		const postData = await metaResponse.json();
		const elementorData = JSON.parse(postData.meta._elementor_data || '[]');

		const widgets = extractAllWidgets(elementorData);

		const hasCalcExpression = widgets.some((widget) => {
			const styles = widget.styles || {};
			const styleString = JSON.stringify(styles);

			return styleString.includes('calc(') || styleString.includes('100%');
		});

		expect(hasCalcExpression).toBe(true);
	});
});

function extractAllWidgets(elements: any[]): any[] {
	const widgets: any[] = [];

	function traverse(element: any) {
		if (element.widgetType) {
			widgets.push(element);
		}

		if (element.elements && Array.isArray(element.elements)) {
			element.elements.forEach(traverse);
		}

		if (element.children && Array.isArray(element.children)) {
			element.children.forEach(traverse);
		}
	}

	elements.forEach(traverse);
	return widgets;
}

function extractTypographyFromStyles(styles: any): {
	fontFamily?: string;
	fontSize?: string;
	fontWeight?: string;
	lineHeight?: string;
} {
	const typography: any = {};

	if (styles.typography) {
		typography.fontFamily = styles.typography.fontFamily?.value;
		typography.fontSize = styles.typography.fontSize?.value;
		typography.fontWeight = styles.typography.fontWeight?.value;
		typography.lineHeight = styles.typography.lineHeight?.value;
	}

	if (styles.font) {
		typography.fontFamily = styles.font.fontFamily?.value || typography.fontFamily;
		typography.fontSize = styles.font.fontSize?.value || typography.fontSize;
		typography.fontWeight = styles.font.fontWeight?.value || typography.fontWeight;
	}

	const styleString = JSON.stringify(styles);
	if (styleString.includes('font-family')) {
		const match = styleString.match(/"font-family"[^}]*"value":\s*"([^"]+)"/);
		if (match) {
			typography.fontFamily = match[1];
		}
	}
	if (styleString.includes('font-size')) {
		const match = styleString.match(/"font-size"[^}]*"value":\s*"([^"]+)"/);
		if (match) {
			typography.fontSize = match[1];
		}
	}
	if (styleString.includes('font-weight')) {
		const match = styleString.match(/"font-weight"[^}]*"value":\s*"([^"]+)"/);
		if (match) {
			typography.fontWeight = match[1];
		}
	}
	if (styleString.includes('line-height')) {
		const match = styleString.match(/"line-height"[^}]*"value":\s*"([^"]+)"/);
		if (match) {
			typography.lineHeight = match[1];
		}
	}

	return typography;
}

function extractColorFromStyles(styles: any): string | undefined {
	if (styles.color?.value) {
		return styles.color.value;
	}

	if (styles.typography?.color?.value) {
		return styles.typography.color.value;
	}

	const styleString = JSON.stringify(styles);
	const colorMatch = styleString.match(/"color"[^}]*"value":\s*"([^"]+)"/);
	if (colorMatch) {
		return colorMatch[1];
	}

	return undefined;
}

