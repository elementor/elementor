import * as React from 'react';
import { Chip, Stack } from '@elementor/ui';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import { getSiteContentStatusFilterLabel } from '../../site-content-status-filter';

export default function ContentPanelActiveFilters() {
	const { statusFilter, setStatusFilter } = useContentPanelCoordinator();

	if ( 'all' === statusFilter ) {
		return null;
	}

	return (
		<Stack direction="row" flexWrap="wrap" gap={ 0.5 } sx={ { width: '100%' } }>
			<Chip
				label={ getSiteContentStatusFilterLabel( statusFilter ) }
				onDelete={ () => setStatusFilter( 'all' ) }
				size="tiny"
			/>
		</Stack>
	);
}