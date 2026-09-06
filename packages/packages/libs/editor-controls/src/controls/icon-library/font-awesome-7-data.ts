export const FONT_AWESOME_7_LIBRARIES = [
	{ file: 'solid', library: 'fa-solid' },
	{ file: 'regular', library: 'fa-regular' },
	{ file: 'brands', library: 'fa-brands' },
] as const;

const FONT_AWESOME_JSON = {
	width: 0,
	height: 1,
	aliases: 2,
	unicode: 3,
	path: 4,
} as const;

type FontAwesomeIconJson = [ number, number, unknown[], unknown, string | string[] ];

export type FontAwesome7EditorConfig = {
	jsonFiles: string[];
	jsonBaseUrl: string;
};

export type FontAwesome7IconDefinition = {
	name: string;
	aliases: string[];
	width: number;
	height: number;
	paths: string[];
};

type CachedLibrary = {
	icons: FontAwesome7IconDefinition[];
	lookup: Record< string, FontAwesome7IconDefinition >;
};

const libraryCache = new Map< string, CachedLibrary >();

export function getFontAwesome7EditorConfig(): FontAwesome7EditorConfig | null {
	const config = window.elementorCommon?.config?.fontAwesome?.v7;

	if ( ! config || ! Array.isArray( config.jsonFiles ) ) {
		return null;
	}

	const jsonBaseUrl = getAllowedJsonBaseUrl( config.jsonBaseUrl );

	if ( ! jsonBaseUrl ) {
		return null;
	}

	return {
		jsonFiles: config.jsonFiles,
		jsonBaseUrl,
	};
}

export function getFontAwesome7IconName( iconValue: string ): string | null {
	return iconValue.match( /^fa\S*\s+fa-(.+)$/ )?.[ 1 ] ?? null;
}

export function resetFontAwesome7IconsCache() {
	libraryCache.clear();
}

export async function loadFontAwesome7Library(
	file: string,
	signal?: AbortSignal
): Promise< FontAwesome7IconDefinition[] > {
	const cached = await getCachedLibrary( file, signal );

	return cached?.icons ?? [];
}

export async function resolveFontAwesome7Icon(
	library: string,
	iconName: string,
	signal?: AbortSignal
): Promise< FontAwesome7IconDefinition | null > {
	const file = getLibraryFileName( library );

	if ( ! file ) {
		return null;
	}

	const cached = await getCachedLibrary( file, signal );

	return cached?.lookup[ iconName ] ?? null;
}

async function getCachedLibrary( file: string, signal?: AbortSignal ): Promise< CachedLibrary | null > {
	const cached = libraryCache.get( file );

	if ( cached ) {
		return cached;
	}

	const loaded = await fetchLibrary( file, signal );

	if ( loaded ) {
		libraryCache.set( file, loaded );
	}

	return loaded;
}

function getLibraryFileName( library: string ): string | null {
	const config = getFontAwesome7EditorConfig();
	const match = FONT_AWESOME_7_LIBRARIES.find( ( item ) => item.library === library );

	if ( ! config || ! match || ! config.jsonFiles.includes( match.file ) ) {
		return null;
	}

	return match.file;
}

async function fetchLibrary( file: string, signal?: AbortSignal ): Promise< CachedLibrary | null > {
	const config = getFontAwesome7EditorConfig();

	if ( ! config?.jsonFiles.includes( file ) ) {
		return null;
	}

	const catalogUrl = getCatalogFileUrl( config.jsonBaseUrl, file );

	if ( ! catalogUrl ) {
		return null;
	}

	try {
		const response = await fetch( catalogUrl, { signal } );

		if ( ! response.ok ) {
			return null;
		}

		const data = ( await response.json() ) as { icons?: Record< string, FontAwesomeIconJson > };
		const icons = data.icons;

		if ( ! icons || typeof icons !== 'object' ) {
			return null;
		}

		return indexLibrary( icons );
	} catch {
		return null;
	}
}

function indexLibrary( icons: Record< string, FontAwesomeIconJson > ): CachedLibrary {
	const definitions: FontAwesome7IconDefinition[] = [];
	const lookup: Record< string, FontAwesome7IconDefinition > = {};

	for ( const [ name, iconData ] of Object.entries( icons ) ) {
		const definition = toIconDefinition( name, iconData );

		if ( ! definition ) {
			continue;
		}

		definitions.push( definition );
		lookup[ name ] = definition;

		for ( const alias of definition.aliases ) {
			if ( ! lookup[ alias ] ) {
				lookup[ alias ] = definition;
			}
		}
	}

	return { icons: definitions, lookup };
}

function toIconDefinition( name: string, iconData: unknown ): FontAwesome7IconDefinition | null {
	if ( ! isValidIconTuple( iconData ) ) {
		return null;
	}

	const paths = normalizePaths( iconData[ FONT_AWESOME_JSON.path ] );

	if ( paths.length === 0 ) {
		return null;
	}

	const aliases = iconData[ FONT_AWESOME_JSON.aliases ].filter(
		( alias ): alias is string => typeof alias === 'string' && alias !== ''
	);

	return {
		name,
		aliases,
		width: iconData[ FONT_AWESOME_JSON.width ],
		height: iconData[ FONT_AWESOME_JSON.height ],
		paths,
	};
}

function isValidIconTuple( iconData: unknown ): iconData is FontAwesomeIconJson {
	return (
		Array.isArray( iconData ) &&
		iconData.length >= 5 &&
		typeof iconData[ FONT_AWESOME_JSON.width ] === 'number' &&
		typeof iconData[ FONT_AWESOME_JSON.height ] === 'number' &&
		Array.isArray( iconData[ FONT_AWESOME_JSON.aliases ] )
	);
}

function normalizePaths( pathData: string | string[] ): string[] {
	if ( typeof pathData === 'string' && isSafeSvgPath( pathData ) ) {
		return [ pathData ];
	}

	if ( ! Array.isArray( pathData ) ) {
		return [];
	}

	return pathData.filter( ( path ): path is string => typeof path === 'string' && isSafeSvgPath( path ) );
}

function isSafeSvgPath( path: string ): boolean {
	return path !== '' && ! /[<>"'`]/.test( path );
}

function getAllowedJsonBaseUrl( jsonBaseUrl: unknown ): string | null {
	if ( typeof jsonBaseUrl !== 'string' || jsonBaseUrl === '' ) {
		return null;
	}

	try {
		const url = new URL( jsonBaseUrl );

		if ( url.protocol !== 'http:' && url.protocol !== 'https:' ) {
			return null;
		}

		return url.href;
	} catch {
		return null;
	}
}

function getCatalogFileUrl( jsonBaseUrl: string, file: string ): string | null {
	try {
		const baseUrl = new URL( jsonBaseUrl );
		const fileUrl = new URL( `${ file }.json`, jsonBaseUrl );

		if ( fileUrl.origin !== baseUrl.origin || ! fileUrl.pathname.startsWith( baseUrl.pathname ) ) {
			return null;
		}

		if ( fileUrl.protocol !== 'http:' && fileUrl.protocol !== 'https:' ) {
			return null;
		}

		return fileUrl.href;
	} catch {
		return null;
	}
}
