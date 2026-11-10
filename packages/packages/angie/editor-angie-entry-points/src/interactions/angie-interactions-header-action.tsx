import * as React from 'react';
import { type InteractionsHeaderProps } from '@elementor/editor-interactions';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const getAngieInteractionsHeaderPrompt = ( { elementId }: InteractionsHeaderProps ) =>
	`At element ${ elementId }, interactions, I want: `;

export const AngieInteractionsHeaderAction = ( { elementId }: InteractionsHeaderProps ) => {
	const label = __( 'Generate with Angie', 'elementor' );
	const prompt = getAngieInteractionsHeaderPrompt( { elementId } );

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
