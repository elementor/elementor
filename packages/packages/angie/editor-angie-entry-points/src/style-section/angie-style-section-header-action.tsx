import * as React from 'react';
import { type StyleSectionHeaderProps } from '@elementor/editor-editing-panel';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const getAngieStyleSectionHeaderPrompt = ( { elementId, sectionName }: StyleSectionHeaderProps ) =>
	`At element ${ elementId }, style section "${ sectionName }", I want: `;

export const AngieStyleSectionHeaderAction = ( { elementId, sectionName }: StyleSectionHeaderProps ) => {
	const label = __( 'Generate with Angie', 'elementor' );
	const prompt = getAngieStyleSectionHeaderPrompt( { elementId, sectionName } );

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
