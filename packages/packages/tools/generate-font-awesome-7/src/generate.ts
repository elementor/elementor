import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

const FONT_AWESOME_MAJOR_VERSION = 7;

const FONT_AWESOME_7_PACKAGES = [
	'@fortawesome/free-solid-svg-icons',
	'@fortawesome/free-regular-svg-icons',
	'@fortawesome/free-brands-svg-icons',
] as const;

type FontAwesome7PackageName = ( typeof FONT_AWESOME_7_PACKAGES )[ number ];

type IconTuple = [ number, number, unknown[], string, string | string[] ];

type IconDefinitionLike = {
	iconName: string;
	icon: IconTuple;
};

type IconsJson = {
	icons: Record< string, IconTuple >;
};

type ReadVersion = ( packageName: FontAwesome7PackageName ) => string;

const FONT_AWESOME_7_PACKS: Array< {
	module: Record< string, unknown >;
	fileName: string;
	packageName: FontAwesome7PackageName;
} > = [
	{ module: fas as Record< string, unknown >, fileName: 'solid', packageName: '@fortawesome/free-solid-svg-icons' },
	{ module: far as Record< string, unknown >, fileName: 'regular', packageName: '@fortawesome/free-regular-svg-icons' },
	{ module: fab as Record< string, unknown >, fileName: 'brands', packageName: '@fortawesome/free-brands-svg-icons' },
];

const require = createRequire( import.meta.url );
const packageRoot = join( dirname( fileURLToPath( import.meta.url ) ), '..' );
const repoRoot = join( packageRoot, '../../../..' );
const outputDir = join( repoRoot, 'assets/lib/font-awesome-7' );

export function readPackageVersion( packageName: FontAwesome7PackageName ): string {
	const packageJsonPath = require.resolve( `${ packageName }/package.json` );

	return JSON.parse( readFileSync( packageJsonPath, 'utf8' ) ).version as string;
}

export function assertFontAwesome7Packages( readVersion: ReadVersion = readPackageVersion ): void {
	for ( const packageName of FONT_AWESOME_7_PACKAGES ) {
		const version = readVersion( packageName );
		const [ major ] = version.split( '.' );

		if ( Number( major ) !== FONT_AWESOME_MAJOR_VERSION ) {
			throw new Error( `Expected ${ packageName } major ${ FONT_AWESOME_MAJOR_VERSION }, found ${ version }.` );
		}
	}
}

export function iconDefinitionToTuple( iconDefinition: IconDefinitionLike ): IconTuple {
	const iconTuple = iconDefinition.icon;

	return [ iconTuple[ 0 ], iconTuple[ 1 ], iconTuple[ 2 ] ?? [], iconTuple[ 3 ], iconTuple[ 4 ] ];
}

export function buildIconsJsonFromPack( iconPackModule: Record< string, unknown > ): IconsJson {
	const icons: Record< string, IconTuple > = {};

	for ( const exportValue of Object.values( iconPackModule ) ) {
		if ( ! isIconDefinition( exportValue ) ) {
			continue;
		}

		icons[ exportValue.iconName ] = iconDefinitionToTuple( exportValue );
	}

	return { icons };
}

export function serializeIconsJson( iconsJson: IconsJson ): string {
	const iconEntries = Object.entries( iconsJson.icons )
		.sort( ( [ leftName ], [ rightName ] ) => leftName.localeCompare( rightName ) )
		.map( ( [ iconName, iconTuple ] ) => `\t${ JSON.stringify( iconName ) }: ${ JSON.stringify( iconTuple ) }` )
		.join( ',\n' );

	return `{\n  "icons": {\n${ iconEntries }\n  }\n}\n`;
}

export function writeFontAwesomeArtifacts( {
	targetDir,
	version,
	iconsByFileName,
	licenseSourcePath,
}: {
	targetDir: string;
	version: string;
	iconsByFileName: Record< string, IconsJson >;
	licenseSourcePath?: string;
} ): void {
	mkdirSync( join( targetDir, 'json' ), { recursive: true } );

	writeFileSync( join( targetDir, 'version.json' ), `${ JSON.stringify( { version }, null, 2 ) }\n` );

	if ( licenseSourcePath && existsSync( licenseSourcePath ) ) {
		copyFileSync( licenseSourcePath, join( targetDir, 'LICENSE.txt' ) );
	}

	for ( const [ fileName, iconsJson ] of Object.entries( iconsByFileName ) ) {
		writeFileSync( join( targetDir, 'json', `${ fileName }.json` ), serializeIconsJson( iconsJson ) );
	}
}

export function generateFontAwesome7( {
	targetDir = outputDir,
	readVersion = readPackageVersion,
}: {
	targetDir?: string;
	readVersion?: ReadVersion;
} = {} ): { targetDir: string; version: string } {
	assertFontAwesome7Packages( readVersion );

	const version = readVersion( '@fortawesome/free-solid-svg-icons' );
	const iconsByFileName: Record< string, IconsJson > = {};

	for ( const pack of FONT_AWESOME_7_PACKS ) {
		iconsByFileName[ pack.fileName ] = buildIconsJsonFromPack( pack.module );
	}

	const licenseSourcePath = join(
		dirname( require.resolve( '@fortawesome/free-solid-svg-icons/package.json' ) ),
		'LICENSE.txt'
	);

	writeFontAwesomeArtifacts( {
		targetDir,
		version,
		iconsByFileName,
		licenseSourcePath,
	} );

	return { targetDir, version };
}

function isIconDefinition( value: unknown ): value is IconDefinitionLike {
	return Boolean(
		value &&
			typeof value === 'object' &&
			typeof ( value as IconDefinitionLike ).iconName === 'string' &&
			Array.isArray( ( value as IconDefinitionLike ).icon ) &&
			( value as IconDefinitionLike ).icon.length >= 5
	);
}

if ( import.meta.url === pathToFileURL( process.argv[ 1 ] ).href ) {
	const result = generateFontAwesome7();

	process.stdout.write( `Generated Font Awesome ${ result.version } artifacts in ${ result.targetDir }\n` );
}
