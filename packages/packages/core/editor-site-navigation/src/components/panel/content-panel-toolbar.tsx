import * as React from 'react';
import { Box, Stack } from '@elementor/ui';

import { contentPanelSearchBoxSx } from './content-panel-chrome';
import ContentPanelActiveFilters from './content-panel-active-filters';
import ContentPanelSearch from './content-panel-search';
import ContentPanelStatusFilter from './content-panel-status-filter';

export default function ContentPanelToolbar() {
	return (
		<Box sx={ contentPanelSearchBoxSx }>
			<Stack gap={ 0.75 } width="100%">
				<Stack alignItems="center" direction="row" gap={ 0.5 } width="100%">
					<Box sx={ { flexGrow: 1, minWidth: 0 } }>
						<ContentPanelSearch />
					</Box>
					<ContentPanelStatusFilter />
				</Stack>
				<ContentPanelActiveFilters />
			</Stack>
		</Box>
	);
}