import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

export const ANGIE_IN_PANELS_EXPERIMENT = 'e_angie_in_panels';

export const getAngieTextPrompt = ( elementId: string ) => `At element ${ elementId } I want: `;

export const AngieTextAction = ( { elementId }: { elementId: string } ) => {
	if ( ! isExperimentActive( ANGIE_IN_PANELS_EXPERIMENT ) ) {
		return null;
	}

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
