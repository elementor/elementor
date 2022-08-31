import { tints, darkTints, text, lineHeight, fontWeight } from 'e-styles';

export default {
	base: {
		shared: `
			color: var(--e-styles-text-color);
			font-size: var(--e-styles-text-font-size, ${ text.base });
			font-weight: ${ fontWeight.normal };
			line-height: var(--e-styles-text-line-height, ${ lineHeight.base });
		`,
		variant: {
			xxs: `
				--e-styles-text-font-size: ${ text.xxs };
				--e-styles-text-line-height: ${ lineHeight.sm };
			`,
			xs: `--e-styles-text-font-size: ${ text.xs };`,
			sm: `--e-styles-text-font-size: ${ text.sm };`,
			md: `--e-styles-text-font-size: ${ text.md };`,
			lg: `--e-styles-text-font-size: ${ text.lg };`,
			xl: `--e-styles-text-font-size: ${ text.xl };`,
		},
	},
	light: `--e-styles-text-color: ${ tints[ '800' ] };`,
	dark: `--e-styles-text-color: ${ darkTints[ '200' ] };`,
};
