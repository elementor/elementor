import {
	AGENT_DISCOVERY_SETTINGS_KEY,
	BOT_ACCESS_SETTINGS_KEY,
	BROWSER_TOOLS_SETTINGS_KEY,
	LLMS_SETTINGS_KEY,
	MARKDOWN_SETTINGS_KEY,
} from '../constants';

const TOGGLE_CHECK_MODULE_KEYS = {
	'agent-path': AGENT_DISCOVERY_SETTINGS_KEY,
	'agent-discovery': AGENT_DISCOVERY_SETTINGS_KEY,
	'agent-discovery-file': AGENT_DISCOVERY_SETTINGS_KEY,
	'ard-manifest': AGENT_DISCOVERY_SETTINGS_KEY,
	'bot-rules': BOT_ACCESS_SETTINGS_KEY,
	'bot-access-control': BOT_ACCESS_SETTINGS_KEY,
	'llms-txt-exists': LLMS_SETTINGS_KEY,
	'llms-txt': LLMS_SETTINGS_KEY,
	'markdown-pages': MARKDOWN_SETTINGS_KEY,
	'markdown-content': MARKDOWN_SETTINGS_KEY,
	'agent-friendly-404s': MARKDOWN_SETTINGS_KEY,
	'agent-friendly-404': MARKDOWN_SETTINGS_KEY,
	'webmcp-support': BROWSER_TOOLS_SETTINGS_KEY,
	'webmcp-manifest': BROWSER_TOOLS_SETTINGS_KEY,
	webmcp: BROWSER_TOOLS_SETTINGS_KEY,
	'webmcp-json': BROWSER_TOOLS_SETTINGS_KEY,
	'agent-browser-tools': BROWSER_TOOLS_SETTINGS_KEY,
	'browser-tools': BROWSER_TOOLS_SETTINGS_KEY,
};

const UNAVAILABLE_REASON_CONFIG_KEYS = {
	[ LLMS_SETTINGS_KEY ]: 'llmsConfig',
	[ BOT_ACCESS_SETTINGS_KEY ]: 'botAccessConfig',
	[ BROWSER_TOOLS_SETTINGS_KEY ]: 'browserToolsConfig',
};

const isSettingEnabled = ( config ) => Boolean( config?.enabled );

const isAvailable = ( config ) => ! config?.unavailableReason;

const normalizeCheckId = ( checkId ) => ( 'string' === typeof checkId ? checkId.trim().toLowerCase() : '' );

export const getToggleModuleKey = ( checkId ) => TOGGLE_CHECK_MODULE_KEYS[ normalizeCheckId( checkId ) ] ?? null;

// The server sends `unavailableReason: { code, message }` when a module can't be turned on here, or null.
export const getModuleUnavailableReason = ( moduleKey, configs = {} ) => {
	const configKey = UNAVAILABLE_REASON_CONFIG_KEYS[ moduleKey ];

	return ( configKey && configs[ configKey ]?.unavailableReason ) || null;
};

export const isAgentReadyModuleToggleDisabled = ( moduleKey, configs = {} ) => null !== getModuleUnavailableReason( moduleKey, configs );

export const getToggleSettingsPatch = ( checkId, isEnabled ) => {
	const moduleKey = getToggleModuleKey( checkId );

	if ( ! moduleKey ) {
		return null;
	}

	return {
		[ moduleKey ]: { enabled: isEnabled },
	};
};

export const getInitialModuleEnabled = ( {
	llmsConfig,
	markdownConfig,
	botAccessConfig,
	agentDiscoveryConfig,
	browserToolsConfig,
} = {} ) => ( {
	[ LLMS_SETTINGS_KEY ]: isSettingEnabled( llmsConfig ) && isAvailable( llmsConfig ),
	[ MARKDOWN_SETTINGS_KEY ]: isSettingEnabled( markdownConfig ),
	[ BOT_ACCESS_SETTINGS_KEY ]: isSettingEnabled( botAccessConfig ) && isAvailable( botAccessConfig ),
	[ AGENT_DISCOVERY_SETTINGS_KEY ]: isSettingEnabled( agentDiscoveryConfig ),
	[ BROWSER_TOOLS_SETTINGS_KEY ]: isSettingEnabled( browserToolsConfig ) && isAvailable( browserToolsConfig ),
} );

export const hasDirtyModuleChecks = ( checks, dirtyModuleKeys ) => checks.some( ( check ) => {
	const moduleKey = getToggleModuleKey( check.id );

	return Boolean( moduleKey && dirtyModuleKeys?.[ moduleKey ] );
} );
