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

export type FontAwesome7Icon = {
	id: string;
	name: string;
	label: string;
	library: string;
	value: string;
	aliases: string[];
	width: number;
	height: number;
	paths: string[];
};

type FontAwesomeIconJson = [ number, number, unknown[], unknown, string | string[] ];

type FontAwesome7EditorConfig = {
	jsonFiles: string[];
	jsonBaseUrl: string;
};

export function getFontAwesome7EditorConfig(): FontAwesome7EditorConfig | null {
	const config = window.elementorCommon?.config?.fontAwesome?.v7;

	if (
		! config ||
		! Array.isArray( config.jsonFiles ) ||
		typeof config.jsonBaseUrl !== 'string' ||
		config.jsonBaseUrl === ''
	) {
		return null;
	}

	return {
		jsonFiles: config.jsonFiles,
		jsonBaseUrl: config.jsonBaseUrl,
	};
}

export async function loadFontAwesome7Catalog( signal?: AbortSignal ): Promise< FontAwesome7Icon[] > {
	const config = getFontAwesome7EditorConfig();

	if ( ! config ) {
		return [];
	}

	const catalogs = await Promise.all(
		FONT_AWESOME_7_LIBRARIES.map( ( library ) => loadLibraryIcons( library, config, signal ) )
	);

	return catalogs.flat();
}

export function filterFontAwesome7Icons( icons: FontAwesome7Icon[], searchValue: string ): FontAwesome7Icon[] {
	const query = searchValue.trim().toLowerCase();

	if ( query === '' ) {
		return icons;
	}

	return icons.filter( ( icon ) => {
		if ( icon.name.includes( query ) || icon.label.toLowerCase().includes( query ) ) {
			return true;
		}

		return icon.aliases.some( ( alias ) => alias.toLowerCase().includes( query ) );
	} );
}

export function createIconSelectionValue( library: string, name: string ): string {
	return `${ library } fa-${ name }`;
}

export function getSelectedIconId( iconClass: string | null, library: string | null ): string | undefined {
	if ( ! iconClass || ! library ) {
		return undefined;
	}

	const name = iconClass.match( /^fa\S*\s+fa-(.+)$/ )?.[ 1 ];

	if ( ! name ) {
		return undefined;
	}

	return `${ library }:${ name }`;
}

export function findFontAwesome7Icon(
	icons: FontAwesome7Icon[],
	iconClass: string | null,
	library: string | null
): FontAwesome7Icon | undefined {
	const selectedId = getSelectedIconId( iconClass, library );

	if ( ! selectedId ) {
		return undefined;
	}

	return icons.find( ( icon ) => icon.id === selectedId );
}

function loadLibraryIcons(
	{ file, library }: ( typeof FONT_AWESOME_7_LIBRARIES )[ number ],
	config: FontAwesome7EditorConfig,
	signal?: AbortSignal
): Promise< FontAwesome7Icon[] > {
	if ( ! config.jsonFiles.includes( file ) ) {
		return Promise.resolve( [] );
	}

	return fetch( `${ config.jsonBaseUrl }${ file }.json`, { signal } )
		.then( ( response ) => ( response.ok ? response.json() : null ) )
		.then( ( data: { icons?: Record< string, FontAwesomeIconJson > } | null ) => {
			if ( ! data?.icons || typeof data.icons !== 'object' ) {
				return [];
			}

			return Object.entries( data.icons ).flatMap( ( [ name, iconData ] ) => {
				const icon = toCatalogIcon( name, library, iconData );

				return icon ? [ icon ] : [];
			} );
		} )
		.catch( () => [] );
}

function toCatalogIcon( name: string, library: string, iconData: unknown ): FontAwesome7Icon | null {
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
		id: `${ library }:${ name }`,
		name,
		label: formatIconLabel( name ),
		library,
		value: createIconSelectionValue( library, name ),
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
	if ( typeof pathData === 'string' && pathData !== '' ) {
		return [ pathData ];
	}

	if ( ! Array.isArray( pathData ) ) {
		return [];
	}

	return pathData.filter( ( path ): path is string => typeof path === 'string' && path !== '' );
}

function formatIconLabel( name: string ): string {
	return name.replace( /-/g, ' ' );
}
