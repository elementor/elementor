import { generateCoverageReport } from './utils/generate-coverage-report';

async function globalTeardown() {
	console.log( '\n🔄 Generating coverage reports...' );
	await generateCoverageReport();
}

export default globalTeardown;




