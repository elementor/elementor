import { parallelTest as base } from '../parallelTest';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const COVERAGE_OUTPUT_DIR = resolve( __dirname, '../../../.nyc_output' );

type CoverageFixtures = {
	autoTestFixture: void;
};

export const test = base.extend<CoverageFixtures>( {
	autoTestFixture: [ async ( { page }, use, testInfo ) => {
		// Start JS coverage
		await page.coverage.startJSCoverage( {
			reportAnonymousScripts: true,
		} );

		// Run the test
		await use();

		// Get HTML source before stopping coverage
		const htmlContent = await page.content();

		// Stop JS coverage
		await page.waitForTimeout( 100 );
		const coverage = await page.coverage.stopJSCoverage();

		// Enrich coverage with source code from HTML
		const enrichedCoverage = coverage.map( ( entry: any ) => {
			// If this is the main page URL and we don't have text, extract from HTML
			if ( entry.url.includes( 'elementor' ) && ! entry.text ) {
				return {
					...entry,
					text: htmlContent, // Include the full HTML which contains inline scripts
				};
			}
			return entry;
		} );

		// Generate a unique filename for this test's coverage data
		const testPath = testInfo.titlePath.join( ' > ' ).replace( /[^a-z0-9]/gi, '_' );
		const timestamp = Date.now();
		const coverageFile = resolve( COVERAGE_OUTPUT_DIR, `coverage-${ testPath }-${ timestamp }.json` );

		// Ensure the output directory exists
		mkdirSync( COVERAGE_OUTPUT_DIR, { recursive: true } );

		// Save coverage data
		writeFileSync( coverageFile, JSON.stringify( enrichedCoverage, null, 2 ) );
	}, { auto: true } ],
} );

export { expect } from '@playwright/test';

