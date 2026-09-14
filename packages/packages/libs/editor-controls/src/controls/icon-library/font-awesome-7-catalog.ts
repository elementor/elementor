import {
	FONT_AWESOME_7_LIBRARIES,
	type FontAwesome7IconDefinition,
	getFontAwesome7EditorConfig,
	getFontAwesome7IconName,
	loadFontAwesome7Library,
} from './font-awesome-7-data';

export { FONT_AWESOME_7_LIBRARIES, getFontAwesome7EditorConfig } from './font-awesome-7-data';

export type FontAwesome7Icon = FontAwesome7IconDefinition & {
	id: string;
	label: string;
	library: string;
	value: string;
};

export async function loadFontAwesome7Catalog( signal?: AbortSignal ): Promise< FontAwesome7Icon[] > {
	const config = getFontAwesome7EditorConfig();

	if ( ! config ) {
		return [];
	}

	const catalogs = await Promise.all(
		FONT_AWESOME_7_LIBRARIES.map( async ( { file, library } ) => {
			if ( ! config.jsonFiles.includes( file ) ) {
				return [];
			}

			const icons = await loadFontAwesome7Library( file, signal );

			return icons.map( ( icon ) => toCatalogIcon( icon, library ) );
		} )
	);

	return catalogs.flat();
}

export function filterFontAwesome7Icons( icons: FontAwesome7Icon[], searchValue?: string | null ): FontAwesome7Icon[] {
	const query = searchValue?.trim().toLowerCase() ?? '';

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

	const name = getFontAwesome7IconName( iconClass );

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

	if ( ! selectedId || ! library ) {
		return undefined;
	}

	const selectedName = selectedId.slice( `${ library }:`.length );

	return icons.find( ( icon ) => {
		if ( icon.library !== library ) {
			return false;
		}

		return icon.id === selectedId || icon.name === selectedName || icon.aliases.includes( selectedName );
	} );
}

function toCatalogIcon( icon: FontAwesome7IconDefinition, library: string ): FontAwesome7Icon {
	return {
		...icon,
		id: `${ library }:${ icon.name }`,
		label: icon.name.replace( /-/g, ' ' ),
		library,
		value: createIconSelectionValue( library, icon.name ),
	};
}
