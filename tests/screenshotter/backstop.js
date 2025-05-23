const config = require( './config' );

const getDelay = ( pathname ) => {
	switch ( pathname ) {
		case 'audio':
		case 'video':
		case 'image-gallery':
			return 3000;
		default:
			return 1000;
	}
};

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
			delay: getDelay( pathname ),
			selectors: [ 'document' ], // With the `document` selector it takes a full page shot.
			onBeforeScript: `${ __dirname }/scripts/on-before-ready.js`,
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
		args: [ '--no-sandbox' ],
		slowMo: 500,
	},
	asyncCaptureLimit: 30,
	asyncCompareLimit: 30,
	debug: false,
	debugWindow: false,
	fileNameTemplate: '{scenarioLabel}_{viewportLabel}',
};
