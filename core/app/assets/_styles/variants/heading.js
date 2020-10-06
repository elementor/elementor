const _$ = require('../index');

const direction = 'left';
const directionVal = '90px';

const style = {
	heading: {
		'text-decoration': 'underline',
		color: 'pink',
		h1: {
			'font-size': '70px',
			color: _$.themeColors( 'warning' ),
			'line-height': '70px',

			'@media screen and (max-width: 960px)': {
				color: 'grey',
			}
		},
		h2: {
			'font-size': '60px',
			color: _$.themeColors( 'info' ),
			'line-height': '60px',
		},

		'@media screen and (max-width: 960px)': {
			color: 'orange',
		}
	},
	'{{ dark }}': {
		heading: {
			h1: {
				color: 'pink',
			}
		}
	},
	'{{ ltr }}': {
		heading: {
			h1: {
				left: directionVal,
			},
		},
	},
	'{{ rtl }}': {
		heading: {
			h1: {
				right: directionVal,
			},
		},
	}
};

module.exports = style;
