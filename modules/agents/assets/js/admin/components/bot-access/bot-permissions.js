import { AcademyIcon, ContentIcon, SearchIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { BOT_PERMISSION_AI_INPUT, BOT_PERMISSION_AI_TRAIN, BOT_PERMISSION_SEARCH } from '../../constants';

export const getBotPermissions = () => [
	{
		permission: BOT_PERMISSION_SEARCH,
		icon: SearchIcon,
		title: __( 'Search', 'elementor' ),
		description: __( 'Use content in search results', 'elementor' ),
	},
	{
		permission: BOT_PERMISSION_AI_INPUT,
		icon: ContentIcon,
		title: __( 'AI input', 'elementor' ),
		description: __( 'Use content to answer prompts', 'elementor' ),
	},
	{
		permission: BOT_PERMISSION_AI_TRAIN,
		icon: AcademyIcon,
		title: __( 'AI training', 'elementor' ),
		description: __( 'Use content to train models', 'elementor' ),
	},
];
