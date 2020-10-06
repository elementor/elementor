const _$ = require('../index');

module.exports = {
	heading: {
		'text-decoration': 'underline',
		color: 'pink',
		h1: {
			'font-size': '70px',
			color: _$.themeColors( 'danger' ),
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
	}
};
