const Url = require( 'url' );
const urls = require( './config/config.url.json' );

const getScenarios = () => {
	const scenarios = [];

	urls.forEach( ( urlPath ) => {
		scenarios.push( {
			label: Url.parse( urlPath, true ).pathname,
			url: urlPath,
			referenceUrl: urlPath,
			readyEvent: '',
			readySelector: '',
			delay: 2000,
			onBeforeScript: `${ __dirname }/scripts/on-before-ready.js`,
			onReadyScript: `${ __dirname }/scripts/on-ready.js`,
			misMatchThreshold: 0,
			requireSameDimensions: true,
		} );
	} );

	return scenarios;
};

module.exports = {
	id: 'elementor_screenshotter',
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
		bitmaps_reference: `backstop_data/reference`,
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
		slowMo: 500,
		args: [ '--no-sandbox' ],
	},
	asyncCaptureLimit: 10,
	asyncCompareLimit: 10,
	debug: false,
	debugWindow: false,
	fileNameTemplate: '{scenarioLabel}_{viewportLabel}',
};
