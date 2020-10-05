const _$ = require('../index');

module.exports = {
	'text-decoration': 'underline',
	color: 'pink',
	h1: {
		'font-size': '70px',
		color: _$.themeColors( 'primary' ),
		'line-height': '70px',

		'&-dark': {
			color: _$.themeColors( 'warning' ),
		},
	},
	h2: {
		'font-size': '60px',
		color: _$.themeColors( 'info' ),
		'line-height': '60px',
	},
	'@media screen and (max-width: 960px)': {
		color: 'orange',
	}
};
