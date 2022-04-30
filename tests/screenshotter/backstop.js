const config = require( './config' );

const getScenarios = () => {
	const scenarios = [];
	const origin = config.url_origin;

	config.templates.forEach( ( pathname ) => {
		scenarios.push( {
			label: pathname,
			url: `${ origin }/${ pathname }/`,
			referenceUrl: `${ origin }/${ pathname }`,
			readyEvent: '',
			readySelector: '',
			delay: 1000,
			selectors: [ 'document' ],
			onBeforeScript: `${ __dirname }/scripts/playwright/on-before-ready-playwright.js`,
			onReadyScript: `${ __dirname }/scripts/playwright/on-ready-playwright.js`,
			misMatchThreshold: 0,
			requireSameDimensions: true,
		} );
	} );

	return scenarios;
};

const testsViewports = () => {
	const view = [];

	config.tests_viewports.forEach( ( viewport ) => {
		view.push( {
			label: viewport.label,
			width: viewport.width,
			height: viewport.height,
		} );
	} );

	return view;
};

module.exports = {
	id: 'elementor_screenshotter',
	viewports: testsViewports(),
	scenarios: getScenarios(),
	paths: {
		bitmaps_reference: `backstop_data/reference`,
		bitmaps_test: `backstop_data/bitmaps_test`,
		engine_scripts: `backstop_data/engine_scripts`,
		html_report: `backstop_data/html_report`,
		ci_report: `backstop_data/ci_report`,
	},
	report: [ 'CI' ],
	ciReport: {
		format: 'junit',
	},
	engine: 'playwright',
	engineOptions: {
		browser: 'chromium',
		args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
	},
	asyncCaptureLimit: 10,
	asyncCompareLimit: 30,
	debug: false,
	debugWindow: false,
	fileNameTemplate: '{scenarioLabel}_{viewportLabel}',
};
