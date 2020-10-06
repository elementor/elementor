const heading = require('./heading');
const utils = require('../utils');

const darkHeading = utils.cloneObj( heading );

module.exports = {
	'.eps-theme-dark': {
		heading: {
			h1: {
				color: 'pink',
			}
		}
	},
};
