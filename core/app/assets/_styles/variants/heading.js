const _$ = require('../index');

module.exports = {
	'text-decoration': 'underline',
	color: 'lightgrey',

	h1: {
		'font-size': '70px',
		color: _$.themeColors( 'primary' ),
		'line-height': '70px',
	},

	h2: {
		'font-size': '60px',
		color: _$.themeColors( 'info' ),
		'line-height': '60px',
	},
};
