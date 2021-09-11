import { themeColors } from 'styles';

export default {
	default: {
		shared: {

		},
		variants: {
			h1: `
				--color: ${ themeColors( 'primary' ) };
				color: var(--color);
				--start-spacing: 90px;
			`,
			h2: `
				color: ${ themeColors( 'info' ) };
		
				@media screen and (max-width: 960px) {
					color: blue;
				}
			`,
		},
	},
	dark: {

	},
};