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

export function createClassItem(
	id: string,
	label: string,
	props: Record< string, unknown > = { color: { $$type: 'color', value: '#000000' } },
): GlobalClassItem {
	return {
		id,
		type: 'class',
		label,
		variants: [ {
			meta: { breakpoint: 'desktop', state: null },
			props,
			custom_css: null,
		} ],
	};
}

export function createColorVariable(
	id: string,
	label: string,
	value: string,
	order: number = 0,
): VariableData {
	return { id, type: 'color', label, value, order, deleted_at: null };
}

export function createFontSizeVariable(
	id: string,
	label: string,
	value: string,
	order: number = 0,
): VariableData {
	return { id, type: 'font-size', label, value, order, deleted_at: null };
}

export async function createDesignSystemZip( data: FixtureData ): Promise< Buffer > {
	const tempDir = fs.mkdtempSync( path.join( os.tmpdir(), 'design-system-fixture-' ) );

	try {
		fs.writeFileSync(
			path.join( tempDir, 'manifest.json' ),
			JSON.stringify( { elementor_version: '4.1.0', version: '3.0' } ),
		);

		if ( data.classes ) {
			const classesDir = path.join( tempDir, 'global-classes' );
			fs.mkdirSync( classesDir );

			for ( const classItem of Object.values( data.classes.items ) ) {
				fs.writeFileSync(
					path.join( classesDir, `${ classItem.id }.json` ),
					JSON.stringify( classItem, null, 2 ),
				);
			}

			const orderEntries = data.classes.order.map( ( id ) => ( {
				id,
				label: data.classes!.items[ id ].label,
			} ) );
			fs.writeFileSync(
				path.join( classesDir, 'order.json' ),
				JSON.stringify( orderEntries, null, 2 ),
			);
		}

		if ( data.variables ) {
			fs.writeFileSync(
				path.join( tempDir, 'global-variables.json' ),
				JSON.stringify( data.variables, null, 2 ),
			);
		}

		const zipPath = path.join( tempDir, 'output.zip' );
		const entriesToZip = fs.readdirSync( tempDir ).filter( ( f ) => f !== 'output.zip' );

		if ( 0 === entriesToZip.length ) {
			throw new Error( 'createDesignSystemZip requires at least one of classes or variables' );
		}

		execSync( `zip -r "${ zipPath }" ${ entriesToZip.map( ( f ) => `"${ f }"` ).join( ' ' ) }`, {
			cwd: tempDir,
			stdio: 'pipe',
		} );

		return fs.readFileSync( zipPath );
	} finally {
		fs.rmSync( tempDir, { recursive: true, force: true } );
	}
}

export function cleanupTempFixture( filePath: string ): void {
	if ( filePath.includes( 'temp-' ) && fs.existsSync( filePath ) ) {
		fs.unlinkSync( filePath );
	}
}

export const SAMPLE_CLASSES_DATA: GlobalClassesData = {
	items: {
		'e-gc-test-header': createClassItem( 'e-gc-test-header', 'TestHeader', {
			color: { $$type: 'color', value: '#333333' },
		} ),
		'e-gc-test-button': createClassItem( 'e-gc-test-button', 'TestButton', {
			color: { $$type: 'color', value: '#ffffff' },
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
