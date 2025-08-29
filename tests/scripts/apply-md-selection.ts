// Tests/scripts/apply-md-selection.ts
import fs from 'node:fs';
import path from 'node:path';

// Constants for better maintainability
const USAGE_MESSAGE = 'Usage: ts-node tests/scripts/apply-md-selection.ts --plan tests/docs/test-plans/x.md --only TC-001,TC-003';
const TEST_TEMPLATE_HEADER = `import { test, expect } from '@playwright/test';
// NOTE: Reuse helpers from tests/playwright/pages/editor-page.ts.
// Import your fixtures/helpers here when needed.
// import EditorPage from '../../pages/editor-page';

test.describe('{widget} — {feature}', () => {
});
`;

// Types for better type safety
interface Row {
	id: string;
	title: string;
	pre: string;
	steps: string[];
	expected: string[];
	priority?: string;
	type?: string;
}

interface ParseResult {
	success: boolean;
	rows: Row[];
	message?: string;
}

interface FileInfo {
	widget: string;
	feature: string;
	specDir: string;
	specFile: string;
}

function parseCommandLineArgs(): { planPath: string | undefined; only: string[] } {
	const planPath = process.argv.find( ( a ) => a.startsWith( '--plan=' ) )?.split( '=' )[ 1 ];
	const only = process.argv
		.find( ( a ) => a.startsWith( '--only=' ) )
		?.split( '=' )[ 1 ]
		?.split( ',' )
		.map( ( s ) => s.trim() )
		.filter( Boolean ) || [];

	return { planPath, only };
}

function validateInputs( planPath: string | undefined, only: string[] ): { success: boolean; message?: string } {
	if ( ! planPath || 0 === only.length ) {
		return { success: false, message: USAGE_MESSAGE };
	}

	if ( ! fs.existsSync( planPath ) ) {
		return { success: false, message: `Error: Plan file not found: ${ planPath }` };
	}

	return { success: true };
}

function parseBulletCards( markdown: string ): Row[] {
	const reHeader = /^###\s*TC-(\d+)\s*[—-]\s*(.+)$/gm;
	const rows: Row[] = [];
	const indices: { id: string; title: string; start: number; end: number }[] = [];

	// Collect block indices
	let match: RegExpExecArray | null;
	while ( ( match = reHeader.exec( markdown ) ) ) {
		indices.push( {
			id: `TC-${ match[ 1 ] }`,
			title: ( match[ 2 ] || '' ).trim(),
			start: match.index + match[ 0 ].length,
			end: markdown.length,
		} );
	}

	// Set end boundaries
	for ( let i = 0; i < indices.length; i++ ) {
		if ( i < indices.length - 1 ) {
			indices[ i ].end = indices[ i + 1 ].start;
		}
	}

	// Parse each block
	for ( const block of indices ) {
		const body = markdown.slice( block.start, block.end );
		const row = parseBlockContent( body, block.id, block.title );
		rows.push( row );
	}

	return rows;
}

function parseBlockContent( body: string, id: string, title: string ): Row {
	// Extract preconditions
	const preMatch = body.match( /^\s*-\s*Preconditions:\s*(.+)$/m );
	const pre = preMatch ? preMatch[ 1 ].trim() : '';

	// Extract steps
	const steps = extractSteps( body );

	// Extract expected results
	const expected = extractExpected( body );

	// Extract optional fields
	const priority = body.match( /^\s*-\s*Priority:\s*(.+)$/m )?.[ 1 ]?.trim();
	const type = body.match( /^\s*-\s*Type:\s*(.+)$/m )?.[ 1 ]?.trim();

	return {
		id,
		title,
		pre,
		steps,
		expected,
		priority,
		type,
	};
}

function extractSteps( body: string ): string[] {
	const steps: string[] = [];
	const stepsSection = body.split( /^\s*-\s*Steps:\s*$/m )[ 1 ]?.split( /^\s*-\s*Expected:\s*$/m )[ 0 ];

	if ( stepsSection ) {
		const numberedMatches = [ ...stepsSection.matchAll( /^\s*(?:\d+|\-)\)\s*(.+)$|^\s*-\s+(.+)$/gm ) ];
		for ( const match of numberedMatches ) {
			const step = ( match[ 1 ] || match[ 2 ] || '' ).trim();
			if ( step ) {
				steps.push( step );
			}
		}

		// Fallback: any numbered lines in the block
		if ( 0 === steps.length ) {
			for ( const match of body.matchAll( /^\s*\d+\)\s*(.+)$/gm ) ) {
				steps.push( ( match[ 1 ] || '' ).trim() );
			}
		}
	}

	return steps;
}

function extractExpected( body: string ): string[] {
	const expected: string[] = [];
	const expectedSection = body.split( /^\s*-\s*Expected:\s*$/m )[ 1 ]?.split( /^\s*-\s*(Priority|Type|Status):/m )[ 0 ];

	if ( expectedSection ) {
		for ( const match of expectedSection.matchAll( /^\s*-\s+(.+)$/gm ) ) {
			const expectation = ( match[ 1 ] || '' ).trim();
			if ( expectation ) {
				expected.push( expectation );
			}
		}

		// Single-line expected fallback
		if ( 0 === expected.length ) {
			const line = expectedSection.split( '\n' ).map( ( s ) => s.trim() ).filter( Boolean )[ 0 ];
			if ( line ) {
				expected.push( line );
			}
		}
	}

	return expected;
}

function parseLegacyTable( markdown: string ): Row[] {
	const tableMatches = [ ...markdown.matchAll( /\|\s*TC-(\d+)\b\s*\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g ) ];

	return tableMatches.map( ( match ) => ( {
		id: `TC-${ match[ 1 ] }`,
		title: match[ 2 ].trim(),
		pre: match[ 3 ].trim(),
		steps: match[ 4 ].trim().split( /\s*\d+\)\s*/ ).map( ( s ) => s.trim() ).filter( Boolean ),
		expected: [ match[ 5 ].trim() ],
		priority: match[ 6 ].trim(),
		type: match[ 7 ].trim(),
	} ) );
}

function parseMarkdown( markdown: string ): ParseResult {
	const bulletRows = parseBulletCards( markdown );
	
	if ( bulletRows.length > 0 ) {
		return { success: true, rows: bulletRows };
	}

	const tableRows = parseLegacyTable( markdown );
	return { success: true, rows: tableRows };
}

function getFileInfo( planPath: string ): FileInfo {
	const base = path.basename( planPath, '.md' );
	const [ widgetRaw, featureRaw ] = base.split( '.' );
	const widget = widgetRaw || 'example';
	const feature = featureRaw || 'basic';

	const specDir = path.join( 'tests', 'playwright', 'sanity', 'modules', widget );
	const specFile = path.join( specDir, `${ feature }.test.ts` );

	return { widget, feature, specDir, specFile };
}

function createTestContent( row: Row ): string {
	const stepsComment = row.steps.length
		? row.steps.map( ( s, i ) => `  // ${ i + 1 }) ${ s }` ).join( '\n' )
		: '  // (add steps)';

	const expectedComment = row.expected.length
		? row.expected.map( ( e ) => `  // - ${ e }` ).join( '\n' )
		: '  // (add expected)';

	return `
test('${ row.id } ${ row.title.replace( /'/g, "\\'" ) }', async ({ page }, testInfo) => {
  // Preconditions: ${ row.pre || '(none specified)' }
${ stepsComment }
${ expectedComment }

  // TODO: Use canonical helpers from editor-page.ts:
  // const editor = new EditorPage(page, testInfo, /* request fixture if needed */);
  // await editor.openNewPage(); // or existing open helper
  // Implement steps above with existing helpers (addElement/addWidget/etc.)
  expect(true).toBeTruthy(); // replace with real assertions
});
`;
}

function writeTestFile( specFile: string, fileInfo: FileInfo, rows: Row[] ): void {
	// Create directory if it doesn't exist
	fs.mkdirSync( fileInfo.specDir, { recursive: true } );

	// Generate header if file doesn't exist
	let header = '';
	if ( ! fs.existsSync( specFile ) ) {
		header = TEST_TEMPLATE_HEADER
			.replace( '{widget}', fileInfo.widget )
			.replace( '{feature}', fileInfo.feature );
		fs.writeFileSync( specFile, header, 'utf8' );
	}

	// Read current content and find insertion point
	const current = fs.readFileSync( specFile, 'utf8' );
	const insertAt = current.lastIndexOf( '});' );
	const prefix = insertAt >= 0 ? current.slice( 0, insertAt ) : current;
	const suffix = insertAt >= 0 ? current.slice( insertAt ) : '';

	// Generate test content
	const generated = rows.map( createTestContent ).join( '' );
	const output = insertAt >= 0 ? prefix + generated + suffix : prefix + generated;

	fs.writeFileSync( specFile, output, 'utf8' );
}

function main(): void {
	const { planPath, only } = parseCommandLineArgs();
	const validation = validateInputs( planPath, only );

	if ( ! validation.success ) {
		// eslint-disable-next-line no-console
		console.error( validation.message );
		process.exit( 1 );
	}

	try {
		const markdown = fs.readFileSync( planPath!, 'utf8' );
		const parseResult = parseMarkdown( markdown );

		if ( ! parseResult.success ) {
			// eslint-disable-next-line no-console
			console.error( parseResult.message );
			process.exit( 1 );
		}

		const filteredRows = parseResult.rows.filter( ( r ) => only.includes( r.id ) );

		if ( 0 === filteredRows.length ) {
			// eslint-disable-next-line no-console
			console.error( 'No matching TC IDs found in plan.' );
			process.exit( 1 );
		}

		const fileInfo = getFileInfo( planPath! );
		writeTestFile( fileInfo.specFile, fileInfo, filteredRows );

		// Log results
		for ( const row of filteredRows ) {
			// eslint-disable-next-line no-console
			console.log( `Added test from ${ row.id } -> ${ fileInfo.specFile }` );
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( `Error processing file: ${ error instanceof Error ? error.message : 'Unknown error' }` );
		process.exit( 1 );
	}
}

// Run the script
main();
