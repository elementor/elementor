import { applyDocumentElementSettings } from '../editor-api';
import { fetchKitSettings, updateKitSettings } from './kit-settings-api';

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
		set?: ( settings: Record< string, unknown > ) => unknown;
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

type GetSiteIdentityResult = {
	editable?: Record< string, boolean >;
	site_name?: string;
	site_description?: string;
	site_logo?: MediaValue;
	site_favicon?: MediaValue;
};

type SetSiteIdentityResult = {
	success: true;
} & GetSiteIdentityResult;

const getElementor = () =>
	(
		window as unknown as {
			elementor?: {
				config?: { kit_id?: number | string };
				documents?: {
					get?: ( id: number | string ) => KitDocument | null | undefined;
					getCurrentId?: () => number | string;
				};
				getContainer?: ( id: string ) => ElementorContainer | null | undefined;
			};
		}
	 ).elementor;

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

const getKitId = (): number | string => {
	const elementor = getElementor();

	if ( ! elementor ) {
		throw new Error( 'Elementor editor is not available.' );
	}

	const kitId = elementor.config?.kit_id;

	if ( undefined === kitId || null === kitId || '' === kitId ) {
		throw new Error( 'Kit ID is missing from the editor configuration.' );
	}

	return kitId;
};

const isKitCurrentDocument = (): boolean => {
	const currentDocumentId = getElementor()?.documents?.getCurrentId?.();

	return Number( currentDocumentId ) === Number( getKitId() );
};

const findLoadedKitContainer = (): ElementorContainer | undefined => {
	const elementor = getElementor();
	const kitId = getKitId();

	return elementor?.documents?.get?.( kitId )?.container ?? elementor?.getContainer?.( String( kitId ) ) ?? undefined;
};

export const resolveKitContainer = (): ElementorContainer => {
	if ( ! isKitCurrentDocument() ) {
		throw new Error( `Kit must be the current document to use its container for ${ TOOL_NAME }.` );
	}

	const container = findLoadedKitContainer();

	if ( ! container ) {
		throw new Error( `Kit document container is not loaded for ${ TOOL_NAME }.` );
	}

	return container;
};

type SettingsSource = {
	read: ( field: string ) => unknown;
	editable?: Record< string, boolean >;
};

const createSettingsSource = async ( fields: SiteIdentityField[] ): Promise< SettingsSource > => {
	if ( isKitCurrentDocument() ) {
		const container = resolveKitContainer();

		return { read: ( field ) => container.settings?.get?.( field ) };
	}

	const { settings, editable } = await fetchKitSettings( fields );

	return { read: ( field ) => settings[ field ], editable };
};

export const getSiteIdentityValues = async ( fields?: SiteIdentityField[] ): Promise< GetSiteIdentityResult > => {
	const selectedFields = fields?.length ? fields : [ ...SITE_IDENTITY_FIELDS ];
	assertAllowedFields( selectedFields );

	const { read: readSetting, editable } = await createSettingsSource( selectedFields );
	const result: GetSiteIdentityResult = editable ? { editable } : {};

	for ( const field of selectedFields ) {
		const raw = readSetting( field );

		if ( 'site_logo' === field || 'site_favicon' === field ) {
			result[ field ] = normalizeMediaValue( raw );
		} else if ( 'site_name' === field || 'site_description' === field ) {
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

	const settings: Record< string, unknown > = {};
	const applied: GetSiteIdentityResult = {};

	for ( const field of patchKeys ) {
		const value = patch[ field ];

		if ( undefined === value ) {
			continue;
		}

		if ( 'site_logo' === field || 'site_favicon' === field ) {
			const media = validateMediaPatch( value, field );
			settings[ field ] = media;
			applied[ field ] = media;
		} else if ( 'site_name' === field || 'site_description' === field ) {
			if ( 'string' !== typeof value ) {
				throw new Error( `Invalid value for "${ field }". Expected a string.` );
			}

			settings[ field ] = value;
			applied[ field ] = value;
		}
	}

	if ( ! Object.keys( settings ).length ) {
		throw new Error( 'patch must include at least one site identity field for set action.' );
	}

	if ( isKitCurrentDocument() ) {
		await applyDocumentElementSettings( resolveKitContainer(), settings );
	} else {
		await updateKitSettings( settings );
		findLoadedKitContainer()?.settings?.set?.( settings );
	}

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
