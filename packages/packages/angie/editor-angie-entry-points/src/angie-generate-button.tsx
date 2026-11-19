import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';

import { getGenerateWithAngieLabel } from './labels';
import { shouldShowAngieEntryPoints } from './v3/is-angie-entry-points-enabled';

export const AngieGenerateButton = ( { prompt }: { prompt: string } ) => {
	if ( ! shouldShowAngieEntryPoints() ) {
		return null;
	}

	const label = getGenerateWithAngieLabel();

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
