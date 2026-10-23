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

const isSettingEnabled = ( config ) => Boolean( config?.enabled );

const normalizeCheckId = ( checkId ) => ( 'string' === typeof checkId ? checkId.trim().toLowerCase() : '' );

export const getToggleModuleKey = ( checkId ) => TOGGLE_CHECK_MODULE_KEYS[ normalizeCheckId( checkId ) ] ?? null;

export const isAgentReadyModuleToggleDisabled = ( moduleKey, {
	llmsConfig,
	botAccessConfig,
	browserToolsConfig,
} = {} ) => {
	if ( BROWSER_TOOLS_SETTINGS_KEY === moduleKey ) {
		return ! browserToolsConfig?.isAvailable;
	}

	if ( LLMS_SETTINGS_KEY === moduleKey ) {
		return Boolean( llmsConfig?.hasPhysicalFile );
	}

	if ( BOT_ACCESS_SETTINGS_KEY === moduleKey ) {
		return Boolean( botAccessConfig?.hasPhysicalFile );
	}

	return false;
};

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
	[ LLMS_SETTINGS_KEY ]: isSettingEnabled( llmsConfig ) && ! llmsConfig?.hasPhysicalFile,
	[ MARKDOWN_SETTINGS_KEY ]: isSettingEnabled( markdownConfig ),
	[ BOT_ACCESS_SETTINGS_KEY ]: isSettingEnabled( botAccessConfig ) && ! botAccessConfig?.hasPhysicalFile,
	[ AGENT_DISCOVERY_SETTINGS_KEY ]: isSettingEnabled( agentDiscoveryConfig ),
	[ BROWSER_TOOLS_SETTINGS_KEY ]: isSettingEnabled( browserToolsConfig ) && Boolean( browserToolsConfig?.isAvailable ),
} );

export const hasDirtyModuleChecks = ( checks, dirtyModuleKeys ) => checks.some( ( check ) => {
	const moduleKey = getToggleModuleKey( check.id );

	return Boolean( moduleKey && dirtyModuleKeys?.[ moduleKey ] );
} );
