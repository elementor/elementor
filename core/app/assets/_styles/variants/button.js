const _$ = require('../index');

module.exports = {
	button: {
		display: 'inline-flex',
		'font-size': '16px',
		'font-weight': 'bold',
		'line-height': '1',
		cursor: 'pointer',

		variant: {
			contained: {
				padding: '30px',
				'border-radius': '5px'
			},
			outlined: {
				'text-decoration': 'underline',
			},
		},

		color: {
			primary: {
				'background-color': _$.themeColors( 'primary' ),
			},
			secondary: {
				'background-color': _$.themeColors( 'info' ),
			}
		},
	}
};
