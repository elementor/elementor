import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

type GlobalClassVariant = {
	meta: { breakpoint: string | null; state: string | null };
	props: Record< string, unknown >;
	custom_css: null;
};

type GlobalClassItem = {
	id: string;
	type: 'class';
	label: string;
	variants: GlobalClassVariant[];
};

type GlobalClassesData = {
	items: Record< string, GlobalClassItem >;
	order: string[];
};

type VariableData = {
	id: string;
	type: 'color' | 'font-size' | 'font-family' | 'font-weight';
	label: string;
	value: string;
	order: number;
	deleted_at: number | null;
};

type VariablesFileData = {
	data: Record< string, VariableData >;
	watermark: string;
};

export type FixtureData = {
	classes?: GlobalClassesData;
	variables?: VariablesFileData;
};

const FIXTURES_DIR = path.join( __dirname );

export function createClassItem(
	id: string,
	label: string,
	props: Record< string, unknown > = {}
): GlobalClassItem {
	return {
		id,
		type: 'class',
		label,
		variants: [ {
			meta: { breakpoint: null, state: null },
			props,
			custom_css: null,
		} ],
	};
}

export function createColorVariable(
	id: string,
	label: string,
	value: string,
	order: number = 0
): VariableData {
	return {
		id,
		type: 'color',
		label,
		value,
		order,
		deleted_at: null,
	};
}

export function createFontSizeVariable(
	id: string,
	label: string,
	value: string,
	order: number = 0
): VariableData {
	return {
		id,
		type: 'font-size',
		label,
		value,
		order,
		deleted_at: null,
	};
}

export async function createDesignSystemZip( data: FixtureData ): Promise< Buffer > {
	const tempDir = fs.mkdtempSync( path.join( os.tmpdir(), 'design-system-fixture-' ) );

	try {
		if ( data.classes ) {
			fs.writeFileSync(
				path.join( tempDir, 'global-classes.json' ),
				JSON.stringify( data.classes, null, 2 )
			);
		}

		if ( data.variables ) {
			fs.writeFileSync(
				path.join( tempDir, 'global-variables.json' ),
				JSON.stringify( data.variables, null, 2 )
			);
		}

		const zipPath = path.join( tempDir, 'output.zip' );
		const filesToZip = fs.readdirSync( tempDir ).filter( ( f ) => f.endsWith( '.json' ) );

		if ( filesToZip.length === 0 ) {
			return Buffer.alloc( 0 );
		}

		execSync( `zip -j "${ zipPath }" ${ filesToZip.map( ( f ) => `"${ f }"` ).join( ' ' ) }`, {
			cwd: tempDir,
			stdio: 'pipe',
		} );

		return fs.readFileSync( zipPath );
	} finally {
		fs.rmSync( tempDir, { recursive: true, force: true } );
	}
}

export async function saveFixture( name: string, data: FixtureData ): Promise< string > {
	const zipBuffer = await createDesignSystemZip( data );
	const filePath = path.join( FIXTURES_DIR, `${ name }.zip` );
	fs.writeFileSync( filePath, zipBuffer );
	return filePath;
}

export async function createTempFixture( data: FixtureData ): Promise< string > {
	const tempName = `temp-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;
	return saveFixture( tempName, data );
}

export function cleanupTempFixture( filePath: string ): void {
	if ( filePath.includes( 'temp-' ) && fs.existsSync( filePath ) ) {
		fs.unlinkSync( filePath );
	}
}

export const SAMPLE_CLASSES_DATA: GlobalClassesData = {
	items: {
		'e-gc-test-header': createClassItem( 'e-gc-test-header', 'Test Header', {
			'font-size': '24px',
			color: '#333333',
		} ),
		'e-gc-test-button': createClassItem( 'e-gc-test-button', 'Test Button', {
			'background-color': '#007bff',
			color: '#ffffff',
			padding: '10px 20px',
		} ),
	},
	order: [ 'e-gc-test-header', 'e-gc-test-button' ],
};

export const SAMPLE_VARIABLES_DATA: VariablesFileData = {
	data: {
		'e-gv-primary-color': createColorVariable( 'e-gv-primary-color', 'Primary Color', '#007bff', 0 ),
		'e-gv-secondary-color': createColorVariable( 'e-gv-secondary-color', 'Secondary Color', '#6c757d', 1 ),
		'e-gv-heading-size': createFontSizeVariable( 'e-gv-heading-size', 'Heading Size', '32px', 2 ),
	},
	watermark: 'test-watermark-123',
};

export const EMPTY_CLASSES_DATA: GlobalClassesData = {
	items: {},
	order: [],
};

export const EMPTY_VARIABLES_DATA: VariablesFileData = {
	data: {},
	watermark: 'empty-watermark',
};

export function getFixturePath( name: string ): string {
	return path.join( FIXTURES_DIR, `${ name }.zip` );
}
