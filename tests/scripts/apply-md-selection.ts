// Tests/scripts/apply-md-selection.ts
import fs from 'node:fs';
import path from 'node:path';

const planPath = process.argv.find( ( a ) => a.startsWith( '--plan=' ) )?.split( '=' )[ 1 ];
const only =
  process.argv
  	.find( ( a ) => a.startsWith( '--only=' ) )
  	?.split( '=' )[ 1 ]
  	?.split( ',' )
  	.map( ( s ) => s.trim() )
  	.filter( Boolean ) || [];

if ( ! planPath || 0 === only.length ) {
	console.error(
		'Usage: ts-node tests/scripts/apply-md-selection.ts --plan tests/docs/test-plans/x.md --only TC-001,TC-003',
	);
	process.exit( 1 );
}

const md = fs.readFileSync( planPath, 'utf8' );

/** ---- Helpers ----------------------------------------------------------- */

function escapeRegExp( s: string ) {
	return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

type Row = {
  id: string;
  title: string;
  pre: string;
  steps: string[];
  expected: string[];
  priority?: string;
  type?: string;
};

function parseBulletCards( markdown: string ): Row[] {
	// Match "### TC-001 — Title" or "### TC-001 - Title"
	const reHeader = /^###\s*TC-(\d+)\s*[—-]\s*(.+)$/gm;
	const rows: Row[] = [];
	let m: RegExpExecArray | null;

	// Collect blocks between headers
	const indices: { id: string; title: string; start: number; end: number }[] = [];
	while ( ( m = reHeader.exec( markdown ) ) ) {
		indices.push( {
			id: `TC-${ m[ 1 ] }`,
			title: ( m[ 2 ] || '' ).trim(),
			start: m.index + m[ 0 ].length,
			end: markdown.length,
		} );
	}
	for ( let i = 0; i < indices.length; i++ ) {
		if ( i < indices.length - 1 ) {
			indices[ i ].end = indices[ i + 1 ].start;
		}
	}

	for ( const blk of indices ) {
		const body = markdown.slice( blk.start, blk.end );

		// - Preconditions: ...
		const preMatch = body.match( /^\s*-\s*Preconditions:\s*(.+)$/m );
		const pre = preMatch ? preMatch[ 1 ].trim() : '';

		// Steps list: either numbered "1) ..." lines or "- ..." under "- Steps:"
		const steps: string[] = [];
		const stepsSection = body.split( /^\s*-\s*Steps:\s*$/m )[ 1 ]?.split( /^\s*-\s*Expected:\s*$/m )[ 0 ];
		if ( stepsSection ) {
			const numbered = [ ...stepsSection.matchAll( /^\s*(?:\d+|\-)\)\s*(.+)$|^\s*-\s+(.+)$/gm ) ];
			for ( const sm of numbered ) {
				const s = ( sm[ 1 ] || sm[ 2 ] || '' ).trim();
				if ( s ) {
					steps.push( s );
				}
			}
			if ( 0 === steps.length ) {
				// Fallback: any lines like "1) ..." in the block
				for ( const sm of body.matchAll( /^\s*\d+\)\s*(.+)$/gm ) ) {
					steps.push( ( sm[ 1 ] || '' ).trim() );
				}
			}
		}

		// Expected bullets after "- Expected:"
		const expected: string[] = [];
		const expectedSection = body.split( /^\s*-\s*Expected:\s*$/m )[ 1 ]?.split( /^\s*-\s*(Priority|Type|Status):/m )[ 0 ];
		if ( expectedSection ) {
			for ( const em of expectedSection.matchAll( /^\s*-\s+(.+)$/gm ) ) {
				const e = ( em[ 1 ] || '' ).trim();
				if ( e ) {
					expected.push( e );
				}
			}
			if ( 0 === expected.length ) {
				// Single-line expected
				const line = expectedSection.split( '\n' ).map( ( s ) => s.trim() ).filter( Boolean )[ 0 ];
				if ( line ) {
					expected.push( line );
				}
			}
		}

		// Optional Priority / Type
		const prio = body.match( /^\s*-\s*Priority:\s*(.+)$/m )?.[ 1 ]?.trim();
		const typ = body.match( /^\s*-\s*Type:\s*(.+)$/m )?.[ 1 ]?.trim();

		rows.push( {
			id: blk.id,
			title: blk.title,
			pre,
			steps,
			expected,
			priority: prio,
			type: typ,
		} );
	}
	return rows;
}

function parseLegacyTable( markdown: string ): Row[] {
	const rows = [ ...markdown.matchAll( /\|\s*TC-(\d+)\b\s*\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g ) ].map( ( m ) => ( {
		id: `TC-${ m[ 1 ] }`,
		title: m[ 2 ].trim(),
		pre: m[ 3 ].trim(),
		steps: m[ 4 ].trim().split( /\s*\d+\)\s*/ ).map( ( s ) => s.trim() ).filter( Boolean ),
		expected: [ m[ 5 ].trim() ],
		priority: m[ 6 ].trim(),
		type: m[ 7 ].trim(),
	} ) );
	return rows;
}

/** ---- Parse ------------------------------------------------------------- */

let parsed: Row[] = [];
const bulletRows = parseBulletCards( md );
if ( bulletRows.length > 0 ) {
	parsed = bulletRows;
} else {
	parsed = parseLegacyTable( md );
}

const rows = parsed.filter( ( r ) => only.includes( r.id ) );

if ( 0 === rows.length ) {
	console.error( 'No matching TC IDs found in plan.' );
	process.exit( 1 );
}

/** ---- Derive widget/feature from plan file ----------------------------- */

const base = path.basename( planPath, '.md' ); // E.g. "div-block.background-color"
const [ widgetRaw, featureRaw ] = base.split( '.' );
const widget = widgetRaw || 'example';
const feature = featureRaw || 'basic';

/** ---- Target spec path -------------------------------------------------- */

const specDir = path.join(
	'tests',
	'playwright',
	'sanity',
	'modules',
	widget,
);
fs.mkdirSync( specDir, { recursive: true } );
const specFile = path.join( specDir, `${ feature }.test.ts` );

/** ---- Write / append ---------------------------------------------------- */

let header = '';
if ( ! fs.existsSync( specFile ) ) {
	header = `import { test, expect } from '@playwright/test';
// NOTE: Reuse helpers from tests/playwright/pages/editor-page.ts.
// Import your fixtures/helpers here when needed.
// import EditorPage from '../../pages/editor-page';

test.describe('${ widget } — ${ feature }', () => {
});
`;
	fs.writeFileSync( specFile, header, 'utf8' );
}

// Insert tests before the closing describe if present
const current = fs.readFileSync( specFile, 'utf8' );
const insertAt = current.lastIndexOf( '});' );
const prefix = insertAt >= 0 ? current.slice( 0, insertAt ) : current;
const suffix = insertAt >= 0 ? current.slice( insertAt ) : '';

let generated = '';
for ( const r of rows ) {
	const stepsComment = r.steps.length ? r.steps.map( ( s, i ) => `  // ${ i + 1 }) ${ s }` ).join( '\n' ) : '  // (add steps)';
	const expectedComment = r.expected.length ? r.expected.map( ( e ) => `  // - ${ e }` ).join( '\n' ) : '  // (add expected)';

	generated += `
test('${ r.id } ${ r.title.replace( /'/g, "\\'" ) }', async ({ page }, testInfo) => {
  // Preconditions: ${ r.pre || '(none specified)' }
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

const output = insertAt >= 0 ? prefix + generated + suffix : prefix + generated;
fs.writeFileSync( specFile, output, 'utf8' );

for ( const r of rows ) {
	console.log( `Added test from ${ r.id } -> ${ specFile }` );
}
