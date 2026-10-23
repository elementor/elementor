import {
	AGENT_DISCOVERY_SETTINGS_KEY,
	BOT_ACCESS_SETTINGS_KEY,
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
	'webmcp-support': AGENT_DISCOVERY_SETTINGS_KEY,
	'webmcp-manifest': AGENT_DISCOVERY_SETTINGS_KEY,
};

export const getToggleModuleKey = ( checkId ) => TOGGLE_CHECK_MODULE_KEYS[ checkId ] ?? null;

export const getToggleSettingsPatch = ( checkId, isEnabled ) => {
	const moduleKey = getToggleModuleKey( checkId );

	if ( ! moduleKey ) {
		return null;
	}

	return {
		[ moduleKey ]: { enabled: isEnabled },
	};
};
