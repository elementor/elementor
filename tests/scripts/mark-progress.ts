import fs from 'node:fs';

const USAGE_MESSAGE = 'Usage: ts-node tests/scripts/mark-progress.ts --plan tests/docs/test-plans/x.md --done TC-001,TC-003';
const MARKDOWN_CHECKBOX_CHECKED = '- [x]';
const TABLE_CHECKBOX_UNCHECKED = '☐';
const TABLE_CHECKBOX_CHECKED = '☑';

interface ProcessResult {
	success: boolean;
	message: string;
	totalReplacements: number;
}

function parseCommandLineArgs(): { planPath: string | undefined; doneList: string[] } {
	const planPath = process.argv.find( ( arg ) => arg.startsWith( '--plan=' ) )?.split( '=' )[ 1 ];
	const doneList = (
		process.argv.find( ( arg ) => arg.startsWith( '--done=' ) )?.split( '=' )[ 1 ] || ''
	)
		.split( ',' )
		.map( ( s ) => s.trim() )
		.filter( Boolean );

	return { planPath, doneList };
}

function validateInputs( planPath: string | undefined, doneList: string[] ): ProcessResult {
	if ( ! planPath || 0 === doneList.length ) {
		return {
			success: false,
			message: USAGE_MESSAGE,
			totalReplacements: 0,
		};
	}

	if ( ! fs.existsSync( planPath ) ) {
		return {
			success: false,
			message: `Error: Plan file not found: ${ planPath }`,
			totalReplacements: 0,
		};
	}

	return { success: true, message: '', totalReplacements: 0 };
}

function escapeRegExp( string: string ): string {
	return string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

function createRegexPatterns( idEsc: string ) {
	return {
		bulletUnchecked: new RegExp(
			`^\\-\\s*\\[\\s*\\]\\s*${ idEsc }\\b([^\\n]*)$`,
			'm',
		),
		tableUnchecked: new RegExp(
			`\\|\\s*${ idEsc }\\s*\\|([^\\n]+)\\|([^\\n]+)\\|([^\\n]+)\\|\\s*${ escapeRegExp( TABLE_CHECKBOX_UNCHECKED ) }\\s*\\|`,
		),
		alreadyCheckedBullet: new RegExp(
			`^\\-\\s*\\[x\\]\\s*${ idEsc }\\b`,
			'm',
		),
		alreadyCheckedTable: new RegExp(
			`\\|\\s*${ idEsc }\\s*\\|([^\\n]+)\\|([^\\n]+)\\|([^\\n]+)\\|\\s*${ escapeRegExp( TABLE_CHECKBOX_CHECKED ) }\\s*\\|`,
		),
	};
}

function processMarkdownContent( md: string, doneList: string[] ): { content: string; totalReplacements: number; warnings: string[] } {
	let totalReplacements = 0;
	const warnings: string[] = [];

	for ( const id of doneList ) {
		const idEsc = escapeRegExp( id );
		const patterns = createRegexPatterns( idEsc );

		if ( patterns.alreadyCheckedBullet.test( md ) || patterns.alreadyCheckedTable.test( md ) ) {
			continue;
		}

		if ( patterns.bulletUnchecked.test( md ) ) {
			md = md.replace( patterns.bulletUnchecked, `${ MARKDOWN_CHECKBOX_CHECKED } ${ id }$1` );
			totalReplacements++;
			continue;
		}

		if ( patterns.tableUnchecked.test( md ) ) {
			md = md.replace(
				patterns.tableUnchecked,
				`| ${ id } |$1|$2|$3| ${ TABLE_CHECKBOX_CHECKED } |`,
			);
			totalReplacements++;
			continue;
		}

		warnings.push( `Warning: could not find mapping entry for ${ id }` );
	}

	return { content: md, totalReplacements, warnings };
}

function main(): void {
	const { planPath, doneList } = parseCommandLineArgs();
	const validation = validateInputs( planPath, doneList );

	if ( ! validation.success ) {
		process.exit( 1 );
	}

	try {
		const md = fs.readFileSync( planPath!, 'utf8' );
		const { content, warnings } = processMarkdownContent( md, doneList );

		warnings.forEach( ( warning ) => {
			process.stderr.write( `${ warning }\n` );
		} );

		fs.writeFileSync( planPath!, content, 'utf8' );
	} catch ( error ) {
		process.stderr.write( `Error processing file: ${ error instanceof Error ? error.message : 'Unknown error' }\n` );
		process.exit( 1 );
	}
}

main();
