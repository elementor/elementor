const _$ = require('../index');

console.log( '_$', _$ );
module.exports = {
	'text-decoration': 'underline',
	color: 'orange',
	h1: {
		'font-size': '70px',
		color: _$.themeColors( 'primary' ),
		'line-height': '70px',
	},
	h2: {
		'font-size': '66px',
		color: _$.themeColors( 'info' ),
		'line-height': '66px',
	},
};
