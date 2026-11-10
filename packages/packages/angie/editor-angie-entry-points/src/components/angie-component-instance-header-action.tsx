import * as React from 'react';
import { type ComponentInstanceHeaderProps } from '@elementor/editor-components';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const getAngieComponentInstanceHeaderPrompt = ( { componentId, elementId }: ComponentInstanceHeaderProps ) =>
	`At component ${ componentId } (instance ${ elementId }) I want: `;

export const AngieComponentInstanceHeaderAction = ( { componentId, elementId }: ComponentInstanceHeaderProps ) => {
	const label = __( 'Generate with Angie', 'elementor' );
	const prompt = getAngieComponentInstanceHeaderPrompt( { componentId, elementId } );

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
