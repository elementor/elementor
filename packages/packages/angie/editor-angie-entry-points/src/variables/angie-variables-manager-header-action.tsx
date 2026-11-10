import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const PROMPT = 'In the design system variables, I want: ';

export const AngieVariablesManagerHeaderAction = () => {
	const label = __( 'Generate with Angie', 'elementor' );

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( PROMPT ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
