import { __ } from '@wordpress/i18n';

export const AGENTS_WORD_GRADIENT = 'linear-gradient(90.42deg, #0C0D0E 64.85%, #ED01EE 85.22%, #FFFFFF 102%)';

export const MODULE_LLMS_TXT = 'llms-txt';
export const MODULE_MARKDOWN_CONTENT = 'markdown-content';
export const MODULE_BOT_ACCESS_CONTROL = 'bot-access-control';
export const MODULE_AGENT_DISCOVERY = 'agent-discovery';

export const LLMS_SETTINGS_KEY = 'llms_txt';
export const MARKDOWN_SETTINGS_KEY = 'markdown_content';
export const BOT_ACCESS_SETTINGS_KEY = 'bot_access_control';
export const AGENT_DISCOVERY_SETTINGS_KEY = 'agent_discovery';

export const BOT_PERMISSION_SEARCH = 'search';
export const BOT_PERMISSION_AI_INPUT = 'aiInput';
export const BOT_PERMISSION_AI_TRAIN = 'aiTrain';
export const BOT_PERMISSIONS = [ BOT_PERMISSION_SEARCH, BOT_PERMISSION_AI_INPUT, BOT_PERMISSION_AI_TRAIN ];
export const BOT_PERMISSION_SETTING_KEYS = {
	[ BOT_PERMISSION_SEARCH ]: 'search',
	[ BOT_PERMISSION_AI_INPUT ]: 'ai_input',
	[ BOT_PERMISSION_AI_TRAIN ]: 'ai_train',
};
export const DEFAULT_BOT_PERMISSIONS = {
	[ BOT_PERMISSION_SEARCH ]: true,
	[ BOT_PERMISSION_AI_INPUT ]: true,
	[ BOT_PERMISSION_AI_TRAIN ]: false,
};

export const BOT_TABLE_COLUMN_WIDTHS = {
	[ BOT_PERMISSION_SEARCH ]: 150,
	[ BOT_PERMISSION_AI_INPUT ]: 150,
	[ BOT_PERMISSION_AI_TRAIN ]: 160,
	action: 132,
};
export const LLMS_FILE_NAME = 'llms.txt';
export const LLMS_VISIBLE_POST_TYPES_LIMIT = 4;

export const MODULE_STATUS_ENABLED = 'enabled';
export const MODULE_STATUS_DISABLED = 'disabled';
export const MODULE_STATUS_WARNING = 'warning';

export const getModules = () => [
	{
		id: MODULE_LLMS_TXT,
		title: __( 'LLMs.txt', 'elementor' ),
		description: __( 'Guide AI agents through your site', 'elementor' ),
	},
	{
		id: MODULE_MARKDOWN_CONTENT,
		title: __( 'Markdown content', 'elementor' ),
		description: __( 'Make your content easier to read', 'elementor' ),
	},
	{
		id: MODULE_BOT_ACCESS_CONTROL,
		title: __( 'Bot access control', 'elementor' ),
		description: __( 'Control how agents use your content', 'elementor' ),
	},
	{
		id: MODULE_AGENT_DISCOVERY,
		title: __( 'Agent discovery', 'elementor' ),
		description: __( 'Tell agents what this site offers them', 'elementor' ),
	},
];
