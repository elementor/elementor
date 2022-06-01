import { tints, darkTints, heading, lineHeight, fontWeight, spacing } from 'e-styles';

export default {
	base: {
		shared: `
			color: var(--e-styles-heading-color, ${ tints[ '800' ] });
			font-size: var(--e-styles-heading-font-size);
			margin-bottom: var(--e-styles-heading-margin-bottom);
		`,
		variant: {
			h1: `
				--e-styles-heading-font-size: ${ heading.h1 };
				--e-styles-heading-margin-bottom: 2.5 * ${ spacing.base };
				font-weight: ${ fontWeight.medium };
				line-height: ${ lineHeight.flat };
			`,
			h2: `
				--e-styles-heading-font-size: ${ heading.h2 };
				--e-styles-heading-margin-bottom: 2.5 * ${ spacing.base };
				font-weight: ${ fontWeight.medium };
				line-height: ${ lineHeight.sm };
				margin-top: 0;
			`,
			h3: `
				--e-styles-heading-font-size: ${ heading.h3 };
				--e-styles-heading-margin-bottom: ${ spacing.base };
				font-weight: ${ fontWeight.medium };
				line-height: ${ lineHeight.sm };
				margin-top: 0;
			`,
			h4: `
				--e-styles-heading-font-size: ${ heading.h4 };
				--e-styles-heading-margin-bottom: ${ spacing.base };
				margin-top: 0;
			`,
			h5: `
				--e-styles-heading-font-size: ${ heading.h5 };
				--e-styles-heading-margin-bottom: ${ spacing.base };
				margin-top: 0;
			`,
			h6: `
				--e-styles-heading-font-size: ${ heading.h6 };
				--e-styles-heading-margin-bottom: ${ spacing.base };
				font-weight: ${ fontWeight.bold };
				margin-top: 0;
			`,
			'display-1': `
				--e-styles-heading-font-size: ${ heading.display1 };
				--e-styles-heading-margin-bottom: ${ spacing.base };
				margin-top: ${ spacing.base };
			`,
			'display-2': `
				--e-styles-heading-font-size: ${ heading.display2 };
				--e-styles-heading-margin-bottom: ${ spacing.base };
				margin-top: ${ spacing.base };
			`,
			'display-3': `
				--e-styles-heading-font-size: ${ heading.display3 };
				--e-styles-heading-margin-bottom: 2.5 * ${ spacing.base };
				margin-top: 0;
			`,
			'display-4': `
				--e-styles-heading-font-size: ${ heading.display4 };
				--e-styles-heading-margin-bottom: ${ spacing.base };
				margin-top: ${ spacing.base };
			`,
		},
		size: `--size-value: default;`,
	},
	light: {
		variant: {
			h1: `--e-styles-heading-color: ${ tints[ '600' ] };`,
			h2: `--e-styles-heading-color: ${ tints[ '600' ] };`,
			'display-3': `--e-styles-heading-color: ${ tints[ '600' ] };`,
		},
	},
	dark: `--e-styles-heading-color: ${ darkTints[ '100' ] };`,
};
