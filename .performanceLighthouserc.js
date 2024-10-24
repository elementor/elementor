module.exports = {
	ci: {
		assert: {
			"total-blocking-time": ["error", {"maxNumericValue": 300}],
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
