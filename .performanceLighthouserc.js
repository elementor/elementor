module.exports = {
	ci: {
		assert: {
			performance: 'error',
			accessibility: 'error',
			includePassedAssertions: true,
		},
		collect: {
			numberOfRuns: 1,
			settings: {
				onlyAudits: [
					'first-meaningful-paint',
					'speed-index',
					'largest-contentful-paint',
					'total-blocking-time',
					'cumulative-layout-shift',
					'server-response-time', // This is TTFB
				],
			},
			url: [ 'http://localhost:8888'],
		},
		upload: {
			target: 'temporary-public-storage',
		},
	},
};
