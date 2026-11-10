import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { type VariableFormHeaderProps } from '@elementor/editor-variables';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const getAngieVariableFormHeaderPrompt = ( { variableType, label }: VariableFormHeaderProps ) => {
	if ( label ) {
		return `For ${ variableType } variable "${ label }" I want: `;
	}

	return `For new ${ variableType } variable I want: `;
};

export const AngieVariableFormHeaderAction = ( props: VariableFormHeaderProps ) => {
	const label = __( 'Generate with Angie', 'elementor' );
	const prompt = getAngieVariableFormHeaderPrompt( props );

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
