import { __ } from '@wordpress/i18n';

export const AGENTS_WORD_GRADIENT = 'linear-gradient(90.42deg, #0C0D0E 64.85%, #ED01EE 85.22%, #FFFFFF 102%)';

export const MODULE_LLMS_TXT = 'llms-txt';
export const MODULE_MARKDOWN_CONTENT = 'markdown-content';
export const MODULE_BOT_ACCESS_CONTROL = 'bot-access-control';
export const MODULE_AGENT_DISCOVERY = 'agent-discovery';
export const MODULE_BROWSER_TOOLS = 'browser-tools';

export const LLMS_SETTINGS_KEY = 'llms_txt';
export const MARKDOWN_SETTINGS_KEY = 'markdown_content';
export const BOT_ACCESS_SETTINGS_KEY = 'bot_access_control';
export const AGENT_DISCOVERY_SETTINGS_KEY = 'agent_discovery';
export const BROWSER_TOOLS_SETTINGS_KEY = 'browser_tools';
export const BUSINESS_DETAILS_SETTINGS_KEY = 'business_details';

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
export const MAX_EXCLUDED_POSTS = 5000;

export const MODULE_STATUS_ENABLED = 'enabled';
export const MODULE_STATUS_DISABLED = 'disabled';
export const MODULE_STATUS_WARNING = 'warning';

export const getModules = () => [
	{
		id: MODULE_LLMS_TXT,
		title: __( 'llms.txt: site guide for AI', 'elementor' ),
		description: __( 'Help AI agents understand and recommend your site', 'elementor' ),
	},
	{
		id: MODULE_MARKDOWN_CONTENT,
		title: __( 'Markdown pages: clean text for AI', 'elementor' ),
		description: __( 'Help agents get clearer content', 'elementor' ),
	},
	{
		id: MODULE_BOT_ACCESS_CONTROL,
		title: __( 'robots.txt rules: AI bot access', 'elementor' ),
		description: __( 'Decide how AI agents can use your content', 'elementor' ),
	},
	{
		id: MODULE_AGENT_DISCOVERY,
		title: __( 'Discovery files (/.well-known)', 'elementor' ),
		description: __( 'Help agents find what your site offers', 'elementor' ),
	},
	{
		id: MODULE_BROWSER_TOOLS,
		title: __( 'WebMCP tools: in-browser agent actions', 'elementor' ),
		description: __( 'Help visitors’ agents find answers on your site', 'elementor' ),
	},
];
