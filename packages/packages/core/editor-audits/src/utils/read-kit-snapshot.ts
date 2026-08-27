import { type KitSnapshot } from '../types';

type GlobalColorApiItem = {
	id: string;
	title?: string;
	value?: string;
};

type GlobalTypographyApiItem = {
	id: string;
	title?: string;
	value?: {
		typography_font_family?: string;
	};
};

type KitColorRow = {
	_id: string;
	color: string;
	title?: string;
};

type KitTypographyRow = {
	_id: string;
	title: string;
	typography_font_family?: string;
};

type AuditWindow = Window & {
	elementor?: {
		documents?: {
			get: ( id: number ) => { config?: { settings?: { settings?: KitDocumentSettings } } } | undefined;
		};
	};
	$e?: {
		data?: {
			get: (
				command: string
			) => Promise< { data?: Record< string, GlobalColorApiItem | GlobalTypographyApiItem > } >;
		};
	};
};

type KitDocumentSettings = {
	system_colors?: KitColorRow[];
	custom_colors?: KitColorRow[];
	system_typography?: KitTypographyRow[];
	custom_typography?: KitTypographyRow[];
};

type GlobalWithValue = { value: string };

function hasNonEmptyGlobalValue< T extends GlobalWithValue >( item: T ): boolean {
	return item.value.length > 0;
}

export async function readKitSnapshot( kitId: number ): Promise< KitSnapshot > {
	const [ colorsFromApi, fontsFromApi ] = await Promise.all( [
		readGlobalsFromApi( 'globals/colors', mapApiColor, hasNonEmptyGlobalValue ),
		readGlobalsFromApi( 'globals/typography', mapApiTypography, hasNonEmptyGlobalValue ),
	] );

	const documentSettings =
		colorsFromApi.length === 0 || fontsFromApi.length === 0 ? getKitDocumentSettings( kitId ) : null;

	const colors = colorsFromApi.length > 0 ? colorsFromApi : readColorsFromKitDocumentSettings( documentSettings );
	const fonts = fontsFromApi.length > 0 ? fontsFromApi : readFontsFromKitDocumentSettings( documentSettings );

	return { id: kitId, globals: { colors, fonts } };
}

async function readGlobalsFromApi< TApiItem, TGlobal extends GlobalWithValue >(
	command: string,
	mapItem: ( item: TApiItem ) => TGlobal,
	hasValue: ( item: TGlobal ) => boolean
): Promise< TGlobal[] > {
	const $e = ( window as AuditWindow ).$e;

	if ( ! $e?.data?.get ) {
		return [];
	}

	try {
		const result = await $e.data.get( command );
		const data = result?.data ?? {};

		return Object.values( data )
			.map( ( item ) => mapItem( item as TApiItem ) )
			.filter( hasValue );
	} catch {
		return [];
	}
}

function mapApiColor( item: GlobalColorApiItem ): KitSnapshot[ 'globals' ][ 'colors' ][ number ] {
	return {
		id: item.id,
		value: item.value ?? '',
		title: item.title ?? item.id,
	};
}

function mapApiTypography( item: GlobalTypographyApiItem ): KitSnapshot[ 'globals' ][ 'fonts' ][ number ] {
	return {
		id: item.id,
		value: item.value?.typography_font_family ?? '',
		title: item.title ?? item.id,
	};
}

function readColorsFromKitDocumentSettings(
	settings: KitDocumentSettings | null
): KitSnapshot[ 'globals' ][ 'colors' ] {
	if ( ! settings ) {
		return [];
	}

	const rows = [ ...( settings.system_colors ?? [] ), ...( settings.custom_colors ?? [] ) ];

	return rows
		.map( ( row ) => ( {
			id: row._id,
			value: row.color,
			title: row.title ?? row._id,
		} ) )
		.filter( hasNonEmptyGlobalValue );
}

function readFontsFromKitDocumentSettings( settings: KitDocumentSettings | null ): KitSnapshot[ 'globals' ][ 'fonts' ] {
	if ( ! settings ) {
		return [];
	}

	const rows = [ ...( settings.system_typography ?? [] ), ...( settings.custom_typography ?? [] ) ];

	return rows
		.map( ( row ) => ( {
			id: row._id,
			value: row.typography_font_family ?? '',
			title: row.title ?? row._id,
		} ) )
		.filter( hasNonEmptyGlobalValue );
}

function getKitDocumentSettings( kitId: number ): KitDocumentSettings | null {
	const document = ( window as AuditWindow ).elementor?.documents?.get?.( kitId );

	return document?.config?.settings?.settings ?? null;
}
