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
			get: ( command: string ) => Promise< { data?: Record< string, GlobalColorApiItem | GlobalTypographyApiItem > } >;
		};
	};
};

type KitDocumentSettings = {
	system_colors?: KitColorRow[];
	custom_colors?: KitColorRow[];
	system_typography?: KitTypographyRow[];
	custom_typography?: KitTypographyRow[];
};

export async function readKitSnapshot( kitId: number ): Promise< KitSnapshot > {
	const colors = await readKitColors( kitId );
	const fonts = await readKitFonts( kitId );

	return { id: kitId, globals: { colors, fonts } };
}

async function readKitColors( kitId: number ): Promise< KitSnapshot[ 'globals' ][ 'colors' ] > {
	const fromApi = await readColorsFromGlobalsApi();

	if ( fromApi.length > 0 ) {
		return fromApi;
	}

	return readColorsFromKitDocument( kitId );
}

async function readKitFonts( kitId: number ): Promise< KitSnapshot[ 'globals' ][ 'fonts' ] > {
	const fromApi = await readFontsFromGlobalsApi();

	if ( fromApi.length > 0 ) {
		return fromApi;
	}

	return readFontsFromKitDocument( kitId );
}

async function readColorsFromGlobalsApi(): Promise< KitSnapshot[ 'globals' ][ 'colors' ] > {
	const $e = ( window as AuditWindow ).$e;

	if ( ! $e?.data?.get ) {
		return [];
	}

	try {
		const result = await $e.data.get( 'globals/colors' );
		const data = result?.data ?? {};

		return Object.values( data )
			.map( ( item ) => mapApiColor( item as GlobalColorApiItem ) )
			.filter( ( color ) => color.value.length > 0 );
	} catch {
		return [];
	}
}

async function readFontsFromGlobalsApi(): Promise< KitSnapshot[ 'globals' ][ 'fonts' ] > {
	const $e = ( window as AuditWindow ).$e;

	if ( ! $e?.data?.get ) {
		return [];
	}

	try {
		const result = await $e.data.get( 'globals/typography' );
		const data = result?.data ?? {};

		return Object.values( data )
			.map( ( item ) => mapApiTypography( item as GlobalTypographyApiItem ) )
			.filter( ( font ) => font.value.length > 0 );
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

function readColorsFromKitDocument( kitId: number ): KitSnapshot[ 'globals' ][ 'colors' ] {
	const settings = getKitDocumentSettings( kitId );

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
		.filter( ( color ) => color.value.length > 0 );
}

function readFontsFromKitDocument( kitId: number ): KitSnapshot[ 'globals' ][ 'fonts' ] {
	const settings = getKitDocumentSettings( kitId );

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
		.filter( ( font ) => font.value.length > 0 );
}

function getKitDocumentSettings( kitId: number ): KitDocumentSettings | null {
	const document = ( window as AuditWindow ).elementor?.documents?.get?.( kitId );

	return document?.config?.settings?.settings ?? null;
}
