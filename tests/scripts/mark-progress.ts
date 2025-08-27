// Tests/scripts/mark-progress.ts
import fs from 'node:fs';

const planPath =
  process.argv.find( ( a ) => a.startsWith( '--plan=' ) )?.split( '=' )[ 1 ];
const doneList = (
	process.argv.find( ( a ) => a.startsWith( '--done=' ) )?.split( '=' )[ 1 ] || ''
)
	.split( ',' )
	.map( ( s ) => s.trim() )
	.filter( Boolean );

if ( ! planPath || 0 === doneList.length ) {
	console.error(
		'Usage: ts-node tests/scripts/mark-progress.ts --plan tests/docs/test-plans/x.md --done TC-001,TC-003',
	);
	process.exit( 1 );
}

let md = fs.readFileSync( planPath, 'utf8' );

function escapeRegExp( s: string ) {
	return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

let totalReplacements = 0;

for ( const id of doneList ) {
	const idEsc = escapeRegExp( id );

	const bulletUnchecked = new RegExp(
		// Start of line, "- [ ]", spaces optional, then TC-ID, capture the rest of the line
		`^\\-\\s*\\[\\s*\\]\\s*${ idEsc }\\b([^\\n]*)$`,
		'm',
	);
	if ( bulletUnchecked.test( md ) ) {
		md = md.replace( bulletUnchecked, `- [x] ${ id }$1` );
		totalReplacements++;
		continue;
	}

	const tableUnchecked = new RegExp(
		`\\|\\s*${ idEsc }\\s*\\|([^\\n]+)\\|([^\\n]+)\\|([^\\n]+)\\|\\s*☐\\s*\\|`,
	);
	if ( tableUnchecked.test( md ) ) {
		md = md.replace(
			tableUnchecked,
			`| ${ id } |$1|$2|$3| ☑ |`,
		);
		totalReplacements++;
		continue;
	}

	// 3) If already checked, do nothing
	const alreadyCheckedBullet = new RegExp(
		`^\\-\\s*\\[x\\]\\s*${ idEsc }\\b`,
		'm',
	);
	const alreadyCheckedTable = new RegExp(
		`\\|\\s*${ idEsc }\\s*\\|([^\\n]+)\\|([^\\n]+)\\|([^\\n]+)\\|\\s*☑\\s*\\|`,
	);
	if ( alreadyCheckedBullet.test( md ) || alreadyCheckedTable.test( md ) ) {
		continue;
	}

	// 4) Not found → warn (but keep going)
	console.warn( `Warning: could not find mapping entry for ${ id }` );
}

fs.writeFileSync( planPath, md, 'utf8' );
console.log(
	`Marked done: ${ doneList.join( ', ' ) } (updated ${ totalReplacements } entr${ 1 === totalReplacements ? 'y' : 'ies' })`,
);
