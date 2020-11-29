const urls = require( './config/config.url.json' );

const getScenarios = () => {
	const scenarios = [];

	urls.forEach( ( url ) => {
		scenarios.push( {
			label: url,
			url: url,
			referenceUrl: url,
			readyEvent: '',
			readySelector: '',
			delay: 2000,
			onReadyScript: `${ __dirname }/scripts/on-ready.js`,
			misMatchThreshold: 0,
			requireSameDimensions: true,
		} );
	} );

	return scenarios;
};

module.exports = {
	id: 'backstop_default',
	viewports: [
		{
			label: 'phone',
			width: 767,
			height: 575,
		},
		{
			label: 'tablet',
			width: 1024,
			height: 768,
		},
		{
			label: 'desktop',
			width: 1366,
			height: 768,
		},
	],
	scenarios: getScenarios(),
	paths: {
		bitmaps_reference: `wp-content/plugins/elementor/tests/screenshotter/reference`,
		bitmaps_test: `backstop_data/bitmaps_test`,
		engine_scripts: `backstop_data/engine_scripts`,
		html_report: `backstop_data/html_report`,
		ci_report: `backstop_data/ci_report`,
	},
	report: [ 'browser', 'CI' ],
	ciReport: {
		format: 'junit',
	},
	engine: 'puppeteer',
	engineOptions: {
		args: [ '--no-sandbox' ],
	},
	asyncCaptureLimit: 1,
	asyncCompareLimit: 10,
	debug: false,
	debugWindow: false,
};
