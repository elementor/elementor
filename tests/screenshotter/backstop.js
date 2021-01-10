const config = require( './config' );

const getScenarios = () => {
	const scenarios = [];
	const origin = config.url_origin;

	config.templates.forEach( ( pathname ) => {
		scenarios.push( {
			label: pathname,
			url: `${ origin }/${ pathname }`,
			referenceUrl: `${ origin }/${ pathname }`,
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
