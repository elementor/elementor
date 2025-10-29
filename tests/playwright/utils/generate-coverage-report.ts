import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createContext } from 'istanbul-lib-report';
import reports from 'istanbul-reports';
import type { CoverageMapData } from 'istanbul-lib-coverage';

const COVERAGE_OUTPUT_DIR = resolve( __dirname, '../../../.nyc_output' );
const COVERAGE_REPORT_DIR = resolve( __dirname, '../../../coverage' );

interface CoverageEntry {
	url: string;
	ranges: Array<{
		start: number;
		end: number;
		count: number;
	}>;
	text?: string;
}

export async function generateCoverageReport() {
	if ( ! existsSync( COVERAGE_OUTPUT_DIR ) ) {
		console.log( '⚠️  No coverage data found. Skipping report generation.' );
		return;
	}

	const coverageFiles = readdirSync( COVERAGE_OUTPUT_DIR ).filter( ( file ) => file.endsWith( '.json' ) );

	if ( coverageFiles.length === 0 ) {
		console.log( '⚠️  No coverage files found. Skipping report generation.' );
		return;
	}

	console.log( `\n📊 Processing ${ coverageFiles.length } coverage file(s)...` );

	const coverageMap = createCoverageMap( {} );
	let processedEntries = 0;
	let filesIncluded = 0;

	// Process each coverage file
	for ( const file of coverageFiles ) {
		const filePath = resolve( COVERAGE_OUTPUT_DIR, file );
		const coverageData = JSON.parse( readFileSync( filePath, 'utf-8' ) ) as CoverageEntry[];

		// Process each coverage entry
		for ( const entry of coverageData ) {
			processedEntries++;

			if ( ! shouldIncludeFile( entry.url ) ) {
				continue;
			}

			if ( ! entry.text ) {
				continue;
			}

			filesIncluded++;

			// Convert V8 coverage to Istanbul format
			const istanbulCoverage = v8CoverageToIstanbul( entry );
			if ( istanbulCoverage ) {
				coverageMap.merge( istanbulCoverage as CoverageMapData );
			}
		}
	}

	console.log( `📁 Processed: ${ processedEntries } entries, ${ filesIncluded } with source code` );
	console.log( `📊 Files in map: ${ Object.keys( coverageMap.files() || {} ).length }` );

	// Debug: show coverage details
	const files = coverageMap.files() || {};
	Object.keys( files ).slice( 0, 3 ).forEach( ( file ) => {
		const fileCov = files[ file ];
		const statements = fileCov.getStatementCoverage();
		console.log( `\n📄 File: ${ file.substring( 0, 80 ) }...` );
		console.log( `   Statements: ${ Object.keys( statements ).length }` );
		console.log( `   Coverage: ${ Object.values( statements ).filter( (s: any) => s > 0 ).length } / ${ Object.keys( statements ).length }` );
	} );

	// Generate reports
	const context = createContext( {
		dir: COVERAGE_REPORT_DIR,
		coverageMap,
	} );

	const htmlReport = reports.create( 'html', {} );
	htmlReport.execute( context );

	const lcovReport = reports.create( 'lcov', {} );
	lcovReport.execute( context );

	const textReport = reports.create( 'text-summary', {} );
	textReport.execute( context );

	console.log( `\n✅ Coverage reports generated:` );
	console.log( `   HTML: ${ resolve( COVERAGE_REPORT_DIR, 'index.html' ) }` );
	console.log( `   LCOV: ${ resolve( COVERAGE_REPORT_DIR, 'lcov.info' ) }` );
}

function shouldIncludeFile( url: string ): boolean {
	// Skip node_modules and external libraries
	if ( url.includes( 'node_modules' ) ) {
		return false;
	}

	// Skip WordPress core
	if ( url.includes( '/wp-includes/' ) || url.includes( '/wp-admin/' ) ) {
		return false;
	}

	// Skip test files
	if ( url.includes( '/test/' ) || url.includes( '/tests/' ) ) {
		return false;
	}

	// Include Elementor editor pages (contains inline bundled code)
	if ( url.includes( 'action=elementor' ) ) {
		return true;
	}

	// Include assets from wp-content/plugins/elementor
	if ( url.includes( '/wp-content/plugins/elementor/' ) ) {
		return true;
	}

	// Skip other external plugins
	if ( url.includes( '/wp-content/plugins/' ) ) {
		return false;
	}

	// Skip other wp-content files
	if ( url.includes( '/wp-content/' ) ) {
		return false;
	}

	return false;
}

function v8CoverageToIstanbul( entry: CoverageEntry ): CoverageMapData | null {
	let source = entry.text;
	if ( ! source ) {
		return null;
	}

	// If this looks like HTML (contains <script> tags), extract JavaScript
	if ( source.includes( '<script' ) ) {
		const scriptMatch = source.match( /<script[^>]*>([\s\S]*?)<\/script>/i );
		if ( scriptMatch && scriptMatch[ 1 ] ) {
			source = scriptMatch[ 1 ].trim();
		}
	}

	if ( ! source ) {
		return null;
	}

	const lines = source.split( '\n' );
	const statementMap: Record<string, any> = {};
	const s: Record<string, number> = {};
	const fnMap: Record<string, any> = {};
	const f: Record<string, number> = {};
	const branchMap: Record<string, any> = {};
	const b: Record<string, number[]> = {};

	// Create statements for each non-empty line
	let stmtIndex = 0;
	const lineToStmtIndex: Record<number, number> = {};

	for ( let i = 0; i < lines.length; i++ ) {
		const line = lines[ i ];
		const trimmed = line.trim();

		// Skip empty lines and comments
		if ( trimmed.length === 0 || trimmed.startsWith( '//' ) ) {
			continue;
		}

		const lineNum = i + 1;
		lineToStmtIndex[ lineNum ] = stmtIndex;

		statementMap[ stmtIndex ] = {
			start: { line: lineNum, column: 0 },
			end: { line: lineNum, column: line.length },
		};
		s[ stmtIndex ] = 0; // Default uncovered
		stmtIndex++;
	}

	// Mark covered lines based on ranges
	if ( entry.ranges && entry.ranges.length > 0 ) {
		// Build offset to line mapping
		let charOffset = 0;
		const offsetToLine: Record<number, number> = {};

		for ( let i = 0; i < lines.length; i++ ) {
			const line = lines[ i ];
			for ( let j = 0; j <= line.length; j++ ) {
				offsetToLine[ charOffset + j ] = i + 1;
			}
			charOffset += line.length + 1; // +1 for newline char
		}

		// Mark statements in covered ranges
		for ( const range of entry.ranges ) {
			const startLine = offsetToLine[ range.start ] || 1;
			const endLine = offsetToLine[ range.end ] || lines.length;

			for ( let i = 0; i < lines.length; i++ ) {
				const lineNum = i + 1;
				if ( lineNum >= startLine && lineNum <= endLine ) {
					const stmtIdx = lineToStmtIndex[ lineNum ];
					if ( stmtIdx !== undefined ) {
						s[ stmtIdx ] = 1; // Mark as covered
					}
				}
			}
		}
	}

	return {
		[ entry.url ]: {
			path: entry.url,
			statementMap,
			fnMap,
			branchMap,
			s,
			f,
			b,
		},
	} as CoverageMapData;
}

