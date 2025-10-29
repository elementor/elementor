import { rmSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const COVERAGE_OUTPUT_DIR = resolve( __dirname, '../../.nyc_output' );
const COVERAGE_REPORT_DIR = resolve( __dirname, '../../coverage' );

async function globalSetup() {
	// Clean previous coverage data
	if ( existsSync( COVERAGE_OUTPUT_DIR ) ) {
		rmSync( COVERAGE_OUTPUT_DIR, { recursive: true, force: true } );
	}
	
	if ( existsSync( COVERAGE_REPORT_DIR ) ) {
		rmSync( COVERAGE_REPORT_DIR, { recursive: true, force: true } );
	}

	// Create fresh directories
	mkdirSync( COVERAGE_OUTPUT_DIR, { recursive: true } );
	mkdirSync( COVERAGE_REPORT_DIR, { recursive: true } );

	console.log( '✓ Coverage directories cleaned and initialized' );
}

export default globalSetup;




