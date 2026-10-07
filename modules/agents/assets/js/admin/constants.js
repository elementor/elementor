import { __ } from '@wordpress/i18n';

export const AGENTS_WORD_GRADIENT = 'linear-gradient(90.42deg, #0C0D0E 64.85%, #ED01EE 85.22%, #FFFFFF 102%)';

export const MODULE_LLMS_TXT = 'llms-txt';
export const MODULE_MARKDOWN_CONTENT = 'markdown-content';
export const MODULE_BOT_ACCESS_CONTROL = 'bot-access-control';

export const LLMS_SETTINGS_KEY = 'llms_txt';
export const MARKDOWN_SETTINGS_KEY = 'markdown_content';
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
];
