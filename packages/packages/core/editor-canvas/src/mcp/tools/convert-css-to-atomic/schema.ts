import { z } from '@elementor/schema';

export const inputSchema = {
	cssString: z
		.string()
		.describe(
			'CSS string to parse (e.g., "color: red; font-size: 16px;")'
		),
};

export const outputSchema = {
	props: z
		.record( z.string(), z.any() )
		.describe(
			'Converted CSS properties in PropValue format. Only whitelisted properties are included.'
		),
	customCss: z
		.string()
		.optional()
		.describe(
			'CSS string containing unsupported properties that could not be converted to atomic PropValues. Use this with custom_css property in _styles configuration.'
		),
};
