import fs from 'fs';
import path from 'path';

const REPO_ROOT = path.resolve( __dirname, '../../..' );

const VERSION_PATTERN = /^\d+\.\d+(?:\.\d+)?(?:[-+.][0-9A-Za-z.-]+)?$/;

function assertVersion( version: string, source: string ): string {
	if ( ! VERSION_PATTERN.test( version ) ) {
		throw new Error( `Invalid version "${ version }" from ${ source }. Expected a version such as 4.3, 4.03 or 4.3.0.` );
	}

	return version;
}

function readCoreVersionFromPlugin(): string | null {
	const pluginFile = path.join( REPO_ROOT, 'elementor.php' );
	if ( ! fs.existsSync( pluginFile ) ) {
		return null;
	}

	const version = fs.readFileSync( pluginFile, 'utf8' ).match( /define\(\s*'ELEMENTOR_VERSION',\s*'([^']+)'\s*\)/ )?.[ 1 ];
	if ( version ) {
		return assertVersion( version, pluginFile );
	}

	return null;
}

export function getCoreVersion(): string {
	if ( process.env.CORE_VERSION ) {
		return assertVersion( process.env.CORE_VERSION, 'CORE_VERSION' );
	}

	const detected = readCoreVersionFromPlugin();
	if ( detected ) {
		return detected;
	}

	throw new Error(
		`Cannot determine the Elementor Core version: CORE_VERSION is not set and elementor.php was not found at ${ path.join( REPO_ROOT, 'elementor.php' ) }.`,
	);
}

export const compareVersions = ( a: string | number, b: string | number ): number => {
	const aParts = String( a || '0.0.0' )
		.split( '.' )
		.map( Number );
	const bParts = String( b || '0.0.0' )
		.split( '.' )
		.map( Number );

	for ( let i = 0; i < Math.max( aParts.length, bParts.length ); i++ ) {
		const aVal = aParts[ i ] || 0;
		const bVal = bParts[ i ] || 0;
		if ( aVal !== bVal ) {
			return aVal - bVal;
		}
	}
	return 0;
};
