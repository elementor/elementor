const _$ = require('../index');
const { dark, ltr, rtl } = _$.selectors;

const h1DirectionVal = '90px';

const style = {
	heading: {
		'text-decoration': 'underline',
		color: 'pink',
		h1: {
			'font-size': '60px',
			color: _$.themeColors( 'warning' ),
			'line-height': '60px',
		},
		h2: {
			'font-size': '60px',
			color: _$.themeColors( 'info' ),
			'line-height': '60px',

			'@media screen and (max-width: 960px)': {
				color: 'blue',
			}
		},
	},
	[ dark ]: {
		heading: {
			h1: {
				color: 'pink',
			}
		}
	},
	[ ltr ]: {
		heading: {
			h1: {
				left: h1DirectionVal,
			},
		},
	},
	[ rtl ]: {
		heading: {
			h1: {
				right: h1DirectionVal,
			},
		},
	}
};

module.exports = style;
