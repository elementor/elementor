import * as React from 'react';
import { CheckIcon } from '@elementor/icons';
import { MenuItem, MenuList, Stack, Typography } from '@elementor/ui';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import {
	getSiteContentStatusFilterLabel,
	hasActiveSiteContentStatusFilters,
	SITE_CONTENT_ALL_FILTER_LABEL,
	SITE_CONTENT_SELECTABLE_STATUS_FILTERS,
	type SiteContentSelectableStatus,
} from '../../site-content-status-filter';

const renderFilterMenuItemContent = ( label: string, selected: boolean ) => (
	<Stack alignItems="center" direction="row" gap={ 1 } width="100%">
		<Typography sx={ { color: 'text.secondary', flex: 1 } } variant="caption">
			{ label }
		</Typography>
		{ selected ? <CheckIcon aria-hidden fontSize="tiny" /> : null }
	</Stack>
);

export default function ContentPanelStatusFilterList() {
	const { clearStatusFilters, statusFilters, toggleStatusFilter } = useContentPanelCoordinator();

	const isAllSelected = ! hasActiveSiteContentStatusFilters( statusFilters );

	return (
		<MenuList dense>
			<MenuItem
				aria-checked={ isAllSelected }
				onClick={ clearStatusFilters }
				role="menuitemcheckbox"
				selected={ isAllSelected }
			>
				{ renderFilterMenuItemContent( SITE_CONTENT_ALL_FILTER_LABEL, isAllSelected ) }
			</MenuItem>
			{ SITE_CONTENT_SELECTABLE_STATUS_FILTERS.map( ( filter ) => {
				const isSelected = statusFilters[ filter ];

				return (
					<MenuItem
						key={ filter }
						aria-checked={ isSelected }
						onClick={ () => toggleStatusFilter( filter ) }
						role="menuitemcheckbox"
						selected={ isSelected }
					>
						{ renderFilterMenuItemContent( getSiteContentStatusFilterLabel( filter ), isSelected ) }
					</MenuItem>
				);
			} ) }
		</MenuList>
	);
}