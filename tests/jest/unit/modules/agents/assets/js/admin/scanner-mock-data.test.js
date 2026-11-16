import {
	getProgressScanGateDurationMs,
	getProgressStepDelaysMs,
	getProgressSteps,
} from 'elementor/modules/agents/assets/js/admin/scanner/scanner-mock-data';

describe( 'scanner mock progress steps', () => {
	it( 'keeps step delays aligned with the scan gate step count', () => {
		expect( getProgressStepDelaysMs() ).toHaveLength( getProgressSteps().length - 1 );
	} );

	it( 'sums gate delays for scan timing', () => {
		const expectedDurationMs = getProgressStepDelaysMs().reduce(
			( totalMs, stepDelayMs ) => totalMs + stepDelayMs,
			0,
		);

		expect( getProgressScanGateDurationMs() ).toBe( expectedDurationMs );
	} );
} );
