import * as React from 'react';
import { type ReactNode } from 'react';
import { Box, Stack } from '@elementor/ui';

import ContentPanelActiveFilters from './content-panel-active-filters';
import { contentPanelSearchBoxSx } from './content-panel-chrome';
import ContentPanelSearch from './content-panel-search';
import ContentPanelSort from './content-panel-sort';
import ContentPanelStatusFilter from './content-panel-status-filter';

type Props = {
	addAction?: ReactNode;
	searchAriaLabel?: string;
};

export default function ContentPanelSectionToolbar( { addAction, searchAriaLabel }: Props ) {
	return (
		<Box sx={ contentPanelSearchBoxSx }>
			<Stack gap={ 0.75 } width="100%">
				<Stack alignItems="center" direction="row" gap={ 0.5 } width="100%">
					<Box sx={ { flexGrow: 1, minWidth: 0 } }>
						<ContentPanelSearch searchAriaLabel={ searchAriaLabel } />
					</Box>
					<ContentPanelStatusFilter />
					<ContentPanelSort />
					{ addAction }
				</Stack>
				<ContentPanelActiveFilters />
			</Stack>
		</Box>
	);
}