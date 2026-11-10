import * as React from 'react';
import { type StyleTabHeaderProps } from '@elementor/editor-editing-panel';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const getAngieStyleTabHeaderPrompt = ( { elementId }: StyleTabHeaderProps ) =>
	`At element ${ elementId }, styles, I want: `;

export const AngieStyleTabHeaderAction = ( props: StyleTabHeaderProps ) => {
	const label = __( 'Generate with Angie', 'elementor' );
	const prompt = getAngieStyleTabHeaderPrompt( props );

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
