import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { AIIcon } from '@elementor/icons';
import { IconButton, Tooltip } from '@elementor/ui';

import { getGenerateWithAngieLabel } from './labels';

export const AngieGenerateButton = ( { prompt }: { prompt: string } ) => {
	const label = getGenerateWithAngieLabel();

	return (
		<Tooltip title={ label } placement="top">
			<IconButton aria-label={ label } size="tiny" onClick={ () => openAngieInAgentMode( prompt ) }>
				<AIIcon fontSize="tiny" />
			</IconButton>
		</Tooltip>
	);
};
