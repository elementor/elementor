const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
	node: process.env.ELASTICSEARCH_NODE,
	auth: {
		apiKey: process.env.ELASTICSEARCH_API_KEY,
	},
});

function removeANSI(text) {
	return text.replace(/\u001b\[[0-9;]*m/g, '');
}

async function run() {
	try {
		const rawData = fs.readFileSync('tests/playwright/test-results.json', 'utf-8');
		const testResults = JSON.parse(rawData);

		const indexName = 'playwright-test-results';
		const bulkBody = [];

		if (testResults.suites && Array.isArray(testResults.suites)) {
			testResults.suites.forEach((suite) => {
				if (suite.specs && Array.isArray(suite.specs)) {
					suite.specs.forEach((spec) => {
						if (spec.tests && Array.isArray(spec.tests)) {
							spec.tests.forEach((test) => {
								if (test.results && Array.isArray(test.results)) {
									test.results.forEach((result) => {
										console.log('Adding result to bulkBody:', test.title, result.status);
										bulkBody.push({
											index: { _index: indexName },
										});
										bulkBody.push({
											suiteTitle: suite.title,
											specTitle: spec.title,
											testName: `${suite.title} / ${spec.title}`,
											status: result.status || 'unknown',
											duration: result.duration || 0,
											errorMessage: result.error ? removeANSI(result.error.message) : null,
											timestamp: new Date(result.startTime || Date.now()).toISOString(),
										});
									});
								}
							});
						}
					});
				}
			});
		});

		if (bulkBody.length > 0) {
			const bulkResponse = await esClient.bulk({ refresh: true, body: bulkBody });
			if (bulkResponse.body && bulkResponse.body.errors) {
				bulkResponse.body.items.forEach((item, index) => {
					if (item.index && item.index.error) {
						console.error(`Indexing error for document ${index}:`, item.index.error);
					}
				});
			}
		}
	} catch (error) {
		console.error('An error occurred:', error);
	}
}

run();
