import { readFileSync } from 'node:fs';

import { load } from 'js-yaml';

export const SEARCH_INDEX_FILE_NAME = 'search-index.json';

export const LICENSE_FREE = 'free';
export const LICENSE_PRO = 'pro';

const CLASSIC_FAMILY = 'classic';

const LIBRARY_BY_FILE_NAME: Record< string, string > = {
	solid: 'fa-solid',
	regular: 'fa-regular',
	brands: 'fa-brands',
};

type IconTuple = [ number, number, unknown[], string, string | string[] ];

type IconsJson = {
	icons: Record< string, IconTuple >;
};

type FamilyStyle = {
	family?: string;
	style?: string;
};

type IconMetadataEntry = {
	label?: string;
	aliases?: { names?: unknown };
	search?: { terms?: unknown };
	familyStylesByLicense?: { free?: FamilyStyle[]; pro?: FamilyStyle[] };
};

export type IconMetadata = Record< string, IconMetadataEntry >;

export type CategoriesByIconName = Record< string, string[] >;

export type SearchIndexEntry = {
	name: string;
	library: string;
	value: string;
	label: string;
	aliases: string[];
	terms: string[];
	categories: string[];
	license: string;
};

export type SearchIndex = {
	icons: SearchIndexEntry[];
};

// Mirrors `createIconSelectionValue` in editor-controls so an icon set through MCP is stored
// byte-identically to one picked by hand in the editor.
export function createIconSelectionValue( library: string, name: string ): string {
	return `${ library } fa-${ name }`;
}

export function readIconMetadata( filePath: string ): IconMetadata {
	const parsed: unknown = JSON.parse( readFileSync( filePath, 'utf8' ) );

	return isPlainObject( parsed ) ? ( parsed as IconMetadata ) : {};
}

export function readCategories( filePath: string ): CategoriesByIconName {
	const parsed: unknown = load( readFileSync( filePath, 'utf8' ) );

	if ( ! isPlainObject( parsed ) ) {
		return {};
	}

	const categoriesByIconName: CategoriesByIconName = {};

	for ( const [ key, category ] of Object.entries( parsed ) ) {
		if ( ! isPlainObject( category ) ) {
			continue;
		}

		const label = typeof category.label === 'string' && '' !== category.label ? category.label : key;

		for ( const iconName of toStringArray( category.icons ) ) {
			categoriesByIconName[ iconName ] = [ ...( categoriesByIconName[ iconName ] ?? [] ), label ];
		}
	}

	return categoriesByIconName;
}

export function buildSearchIndex( {
	iconsByFileName,
	metadata,
	categoriesByIconName,
}: {
	iconsByFileName: Record< string, IconsJson >;
	metadata: IconMetadata;
	categoriesByIconName: CategoriesByIconName;
} ): SearchIndex {
	const icons: SearchIndexEntry[] = [];

	for ( const [ fileName, iconsJson ] of Object.entries( iconsByFileName ) ) {
		const library = LIBRARY_BY_FILE_NAME[ fileName ];

		if ( ! library ) {
			continue;
		}

		for ( const [ name, iconTuple ] of Object.entries( iconsJson.icons ) ) {
			icons.push(
				buildEntry( {
					name,
					library,
					style: fileName,
					iconTuple,
					entry: metadata[ name ],
					categories: categoriesByIconName[ name ] ?? [],
				} )
			);
		}
	}

	icons.sort(
		( left, right ) => left.library.localeCompare( right.library ) || left.name.localeCompare( right.name )
	);

	return { icons };
}

export function serializeSearchIndex( searchIndex: SearchIndex ): string {
	const entries = searchIndex.icons.map( ( entry ) => `\t${ JSON.stringify( entry ) }` ).join( ',\n' );

	return `{\n  "icons": [\n${ entries }\n  ]\n}\n`;
}

function buildEntry( {
	name,
	library,
	style,
	iconTuple,
	entry,
	categories,
}: {
	name: string;
	library: string;
	style: string;
	iconTuple: IconTuple;
	entry?: IconMetadataEntry;
	categories: string[];
} ): SearchIndexEntry {
	const metadataAliases = toStringArray( entry?.aliases?.names );
	const packAliases = toStringArray( iconTuple[ 2 ] );

	return {
		name,
		library,
		value: createIconSelectionValue( library, name ),
		label: typeof entry?.label === 'string' && '' !== entry.label ? entry.label : toFallbackLabel( name ),
		aliases: unique( [ ...metadataAliases, ...packAliases ] ),
		terms: unique( toStringArray( entry?.search?.terms ) ),
		categories: unique( categories ),
		license: resolveLicense( entry, style ),
	};
}

function resolveLicense( entry: IconMetadataEntry | undefined, style: string ): string {
	if ( ! entry ) {
		return LICENSE_FREE;
	}

	const isFree = ( entry.familyStylesByLicense?.free ?? [] ).some(
		( familyStyle ) => CLASSIC_FAMILY === familyStyle?.family && style === familyStyle?.style
	);

	return isFree ? LICENSE_FREE : LICENSE_PRO;
}

function toFallbackLabel( name: string ): string {
	return name.replace( /-/g, ' ' );
}

function toStringArray( value: unknown ): string[] {
	if ( ! Array.isArray( value ) ) {
		return [];
	}

	return value.filter( ( item ): item is string => 'string' === typeof item && '' !== item );
}

function unique( values: string[] ): string[] {
	return [ ...new Set( values ) ].sort( ( left, right ) => left.localeCompare( right ) );
}

function isPlainObject( value: unknown ): value is Record< string, unknown > {
	return Boolean( value ) && 'object' === typeof value && ! Array.isArray( value );
}
