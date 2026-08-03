import { getV1CurrentDocument, setDocumentModifiedStatus } from '@elementor/editor-documents';

export const AGENTS_SETTINGS_KEY = 'agents';
export const LLMS_SETTINGS_KEY = 'llms';

type SettingsBag = {
	get: ( key: string ) => unknown;
	set: ( key: string, value: unknown ) => void;
};

export function getKitSettingsBag(): SettingsBag | null {
	const settings = getV1CurrentDocument()?.container?.settings;

	return settings ? ( settings as SettingsBag ) : null;
}

export function readLlmsContent(): string {
	const settings = getKitSettingsBag();
	const agents = settings?.get( AGENTS_SETTINGS_KEY );

	if ( ! agents || typeof agents !== 'object' ) {
		return '';
	}

	const llms = ( agents as Record< string, unknown > )[ LLMS_SETTINGS_KEY ];

	return typeof llms === 'string' ? llms : '';
}

export function writeLlmsContent( content: string ): boolean {
	const settings = getKitSettingsBag();

	if ( ! settings ) {
		return false;
	}

	const existingAgents = settings.get( AGENTS_SETTINGS_KEY );
	const agents = existingAgents && typeof existingAgents === 'object'
		? { ...( existingAgents as Record< string, unknown > ) }
		: {};

	if ( '' === content ) {
		delete agents[ LLMS_SETTINGS_KEY ];

		if ( 0 === Object.keys( agents ).length ) {
			settings.set( AGENTS_SETTINGS_KEY, undefined );
		} else {
			settings.set( AGENTS_SETTINGS_KEY, agents );
		}
	} else {
		agents[ LLMS_SETTINGS_KEY ] = content;
		settings.set( AGENTS_SETTINGS_KEY, agents );
	}

	setDocumentModifiedStatus( true );

	return true;
}
