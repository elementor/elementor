import { themeColors } from 'e-styles';

export default {
	root: {
		shared: `
			color: var(--color, red);
		`,
		variants: {
			h1: `
				text-decoration: underline;
			`,
			h2: `
				border: 1px solid blue;
			`,
		},
	},
	light: {
		variants: {
			h1: `
				--color: ${ themeColors( 'primary' ) };
			`,
			h2: `
				border: 1px solid blue;
			`,
		},
	},
	dark: {
		variants: {
			h1: `
				--color: ${ themeColors( 'info' ) };
			`,
		},
	},
};
