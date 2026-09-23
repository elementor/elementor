import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

export const CURRENT_PUBLISHED_CORE_VERSION = '4.3.0';

const CORE_PHP_CANDIDATES = [
	resolve( __dirname, '../../../elementor.php' ),
	resolve( process.cwd(), '../elementor/elementor.php' ),
	resolve( process.cwd(), 'elementor.php' ),
];

const toVersionParts = ( version: string ): number[] =>
	version.split( /[.-]/ ).map( ( part ) => {
		const parsed = parseInt( part, 10 );

		return Number.isNaN( parsed ) ? 0 : parsed;
	} );

export const compareCoreVersions = ( a: string, b: string ): number => {
	const left = toVersionParts( a );
	const right = toVersionParts( b );
	const length = Math.max( left.length, right.length );

	for ( let index = 0; index < length; index++ ) {
		const delta = ( left[ index ] ?? 0 ) - ( right[ index ] ?? 0 );

		if ( 0 !== delta ) {
			return delta;
		}
	}

	return 0;
};

export const readCoreVersionFromPluginFile = (): string => {
	const pluginFile = CORE_PHP_CANDIDATES.find( ( candidate ) => existsSync( candidate ) );

	if ( ! pluginFile ) {
		return '0.0.0';
	}

	const match = readFileSync( pluginFile, 'utf8' ).match( /^\s*\*\s*Version:\s*([0-9.]+)/m );

	return match?.[ 1 ] ?? '0.0.0';
};

export const isCoreVersionAbovePublished = (
	coreVersion = readCoreVersionFromPluginFile(),
	publishedVersion = CURRENT_PUBLISHED_CORE_VERSION,
): boolean => compareCoreVersions( coreVersion, publishedVersion ) > 0;
