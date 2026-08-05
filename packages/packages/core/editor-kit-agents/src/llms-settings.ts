import { getV1CurrentDocument, setDocumentModifiedStatus } from '@elementor/editor-documents';

export const AGENTS_SETTINGS_KEY = 'agents';
export const LLMS_SETTINGS_KEY = 'llms';

type AgentsSettings = Record< string, unknown >;

type SettingsBag = {
	get: ( key: string ) => unknown;
	set: ( key: string, value: unknown ) => void;
};

export function getKitSettingsBag(): SettingsBag | null {
	const settings = getV1CurrentDocument()?.container?.settings;

	return settings ? ( settings as SettingsBag ) : null;
}

function readAgentsSettings( settings: SettingsBag | null ): AgentsSettings {
	const agents = settings?.get( AGENTS_SETTINGS_KEY );

	return agents && typeof agents === 'object' ? { ...( agents as AgentsSettings ) } : {};
}

function omitLlms( agents: AgentsSettings ): AgentsSettings {
	return Object.fromEntries( Object.entries( agents ).filter( ( [ key ] ) => key !== LLMS_SETTINGS_KEY ) );
}

function isEmpty( agents: AgentsSettings ): boolean {
	return 0 === Object.keys( agents ).length;
}

export function readLlmsContent(): string {
	const llms = readAgentsSettings( getKitSettingsBag() )[ LLMS_SETTINGS_KEY ];

	return typeof llms === 'string' ? llms : '';
}

export function writeLlmsContent( content: string ): boolean {
	const settings = getKitSettingsBag();

	if ( ! settings ) {
		return false;
	}

	const agents = readAgentsSettings( settings );

	if ( '' === content ) {
		const remainingAgents = omitLlms( agents );

		settings.set( AGENTS_SETTINGS_KEY, isEmpty( remainingAgents ) ? undefined : remainingAgents );
	} else {
		settings.set( AGENTS_SETTINGS_KEY, { ...agents, [ LLMS_SETTINGS_KEY ]: content } );
	}

	setDocumentModifiedStatus( true );

	return true;
}
