"use strict";

const TEMPLATE_NAME = process.env.TEMPLATE_NAME;
const assertions = (() => {
	try {
		return require(`./tests/lighthouse/baselines/${TEMPLATE_NAME}`);
	} catch (e) {
		return {};
	}
})();

module.exports = {
	"ci": {
		"collect": {
			"method": "node",
			"numberOfRuns": 3,
			"maxWaitForLoad": 90000,
			"headful": false,
			"settings": {
				"preset": "desktop"
			},
		},
		"assert": {
			// https://github.com/GoogleChrome/lighthouse-ci/blob/main/packages/utils/src/presets/recommended.js
			// https://github.com/GoogleChrome/lighthouse-ci/blob/main/packages/utils/src/presets/no-pwa.js
			"preset": "lighthouse:no-pwa",
			assertions,
		},
		"upload": {
			"target": "filesystem",
		},
	},
};
