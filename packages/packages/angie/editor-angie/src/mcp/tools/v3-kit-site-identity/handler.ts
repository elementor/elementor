const TOOL_NAME = 'v3-kit-site-identity';

const SITE_IDENTITY_FIELDS = [ 'site_description', 'site_favicon', 'site_logo', 'site_name' ] as const;

type SiteIdentityField = ( typeof SITE_IDENTITY_FIELDS )[ number ];

type MediaValue = {
	id: number;
	url: string;
};

type ElementorContainer = {
	settings?: {
		get?: ( controlName: string ) => unknown;
	};
};

type KitDocument = {
	container?: ElementorContainer | null;
};

export type SiteIdentityMediaPatch = {
	id: number;
	url?: string;
};

export type SiteIdentityPatch = {
	site_name?: string;
	site_description?: string;
	site_logo?: SiteIdentityMediaPatch;
	site_favicon?: SiteIdentityMediaPatch;
};

export type KitSiteIdentityToolParams = {
	action: 'get' | 'set';
	fields?: SiteIdentityField[];
	patch?: SiteIdentityPatch;
};

type GetSiteIdentityResult = Partial< Record< SiteIdentityField, string | MediaValue > >;

type SetSiteIdentityResult = {
	success: true;
} & Partial< Record< SiteIdentityField, string | MediaValue > >;

const getElementor = () =>
	(
		window as unknown as {
			elementor?: {
				config?: { kit_id?: number | string };
				documents?: {
					get?: ( id: number | string ) => KitDocument | null | undefined;
				};
				getContainer?: ( id: string ) => ElementorContainer | null | undefined;
			};
		}
	 ).elementor;

const getCommands = () =>
	(
		window as unknown as {
			$e?: { run?: ( command: string, args?: Record< string, unknown > ) => Promise< unknown > | unknown };
		}
	 ).$e;

const isMediaField = ( field: SiteIdentityField ): boolean => 'site_logo' === field || 'site_favicon' === field;

const assertAllowedFields = ( fields: SiteIdentityField[] ) => {
	const invalid = fields.filter( ( field ) => ! ( SITE_IDENTITY_FIELDS as readonly string[] ).includes( field ) );

	if ( invalid.length ) {
		throw new Error(
			`Invalid field(s): ${ invalid.join( ', ' ) }. Allowed: ${ SITE_IDENTITY_FIELDS.join( ', ' ) }.`
		);
	}
};

const normalizeMediaValue = ( value: unknown ): MediaValue => {
	if ( value && 'object' === typeof value ) {
		const record = value as Record< string, unknown >;
		const id = 'number' === typeof record.id ? record.id : Number( record.id ) || 0;
		const url = 'string' === typeof record.url ? record.url : '';

		return { id, url };
	}

	return { id: 0, url: '' };
};

const validateMediaPatch = ( value: unknown, fieldName: string ): MediaValue => {
	if ( ! value || 'object' !== typeof value ) {
		throw new Error(
			`Invalid media shape for "${ fieldName }". Expected an object with numeric id and optional url string.`
		);
	}

	const record = value as Record< string, unknown >;

	if ( 'number' !== typeof record.id || ! Number.isFinite( record.id ) ) {
		throw new Error(
			`Invalid media shape for "${ fieldName }". Expected an object with numeric id and optional url string.`
		);
	}

	if ( undefined !== record.url && 'string' !== typeof record.url ) {
		throw new Error(
			`Invalid media shape for "${ fieldName }". Expected an object with numeric id and optional url string.`
		);
	}

	return {
		id: record.id,
		url: 'string' === typeof record.url ? record.url : '',
	};
};

export const resolveKitContainer = (): ElementorContainer => {
	const elementor = getElementor();

	if ( ! elementor ) {
		throw new Error( 'Elementor editor is not available.' );
	}

	const kitId = elementor.config?.kit_id;

	if ( undefined === kitId || null === kitId || '' === kitId ) {
		throw new Error( 'Kit ID is missing from the editor configuration.' );
	}

	const kitDocument = elementor.documents?.get?.( kitId );
	let container = kitDocument?.container ?? undefined;

	if ( ! container && elementor.getContainer ) {
		container = elementor.getContainer( String( kitId ) ) ?? undefined;
	}

	if ( ! container ) {
		throw new Error( `Kit document container is not loaded for ${ TOOL_NAME }.` );
	}

	return container;
};

export const getSiteIdentityValues = ( fields?: SiteIdentityField[] ): GetSiteIdentityResult => {
	const selectedFields = fields?.length ? fields : [ ...SITE_IDENTITY_FIELDS ];
	assertAllowedFields( selectedFields );

	const container = resolveKitContainer();
	const result: GetSiteIdentityResult = {};

	for ( const field of selectedFields ) {
		const raw = container.settings?.get?.( field );

		if ( isMediaField( field ) ) {
			result[ field ] = normalizeMediaValue( raw );
		} else {
			result[ field ] = 'string' === typeof raw ? raw : '';
		}
	}

	return result;
};

export const setSiteIdentityValues = async ( patch: SiteIdentityPatch ): Promise< SetSiteIdentityResult > => {
	const patchKeys = Object.keys( patch ) as SiteIdentityField[];

	if ( ! patchKeys.length ) {
		throw new Error( 'patch must include at least one site identity field for set action.' );
	}

	assertAllowedFields( patchKeys );

	const container = resolveKitContainer();
	const settings: Record< string, unknown > = {};
	const applied: Partial< Record< SiteIdentityField, string | MediaValue > > = {};

	for ( const field of patchKeys ) {
		const value = patch[ field ];

		if ( undefined === value ) {
			continue;
		}

		if ( isMediaField( field ) ) {
			const media = validateMediaPatch( value, field );
			settings[ field ] = media;
			applied[ field ] = media;
		} else if ( 'string' === typeof value ) {
			settings[ field ] = value;
			applied[ field ] = value;
		} else {
			throw new Error( `Invalid value for "${ field }". Expected a string.` );
		}
	}

	if ( ! Object.keys( settings ).length ) {
		throw new Error( 'patch must include at least one site identity field for set action.' );
	}

	const run = getCommands()?.run;

	if ( ! run ) {
		throw new Error( 'Elementor commands API is not available.' );
	}

	await run( 'document/elements/settings', {
		container,
		settings,
		options: {
			external: true,
		},
	} );

	return {
		success: true,
		...applied,
	};
};

export const handleKitSiteIdentityTool = async (
	params: KitSiteIdentityToolParams
): Promise< GetSiteIdentityResult | SetSiteIdentityResult > => {
	const { action, fields, patch } = params;

	switch ( action ) {
		case 'get':
			return getSiteIdentityValues( fields );
		case 'set':
			if ( ! patch ) {
				throw new Error( 'patch is required for set action.' );
			}

			return setSiteIdentityValues( patch );
		default:
			throw new Error( `Unknown action: ${ action as string }` );
	}
};