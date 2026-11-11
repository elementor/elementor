import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const getAngieTextPrompt = ( elementId: string ) => `At element ${ elementId } I want: `;

export const AngieTextAction = ( { elementId }: { elementId: string } ) => {
	const label = __( 'Generate with Angie', 'elementor' );

	return (
		<Tooltip title={ label } placement="top">
			<IconButton
				aria-label={ label }
				size="tiny"
				onClick={ () => openAngieInAgentMode( getAngieTextPrompt( elementId ) ) }
			>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
