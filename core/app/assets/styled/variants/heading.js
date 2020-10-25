const _$ = require('../index');
const { dark, ltr, rtl } = _$.selectors;

const style = {
	heading: {
		default: `
			color: blue;
		`,
		h1: `
			--color: ${ _$.themeColors( 'primary' ) };
			color: var(--color);
			--start-spacing: 90px;
		`,
		h2: `
			color: ${ _$.themeColors( 'info' ) };

			@media screen and (max-width: 960px) {
				color: blue;
			}
		`,
	},
	[ dark ]: {
		heading: {
			h1: `
				--color: ${ _$.themeColors( 'info' ) };
			`,
		}
	},
	[ ltr ]: {
		heading: {
			h1: `
				left: var(--start-spacing);
			`,
		},
	},
	[ rtl ]: {
		heading: {
			h1: `
				right: var(--start-spacing);
			`,
		},
	}
};

module.exports = style;
