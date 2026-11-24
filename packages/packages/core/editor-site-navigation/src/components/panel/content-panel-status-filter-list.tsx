import * as React from 'react';
import { CheckIcon } from '@elementor/icons';
import { MenuItem, MenuList, Stack, Typography } from '@elementor/ui';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import useAccessiblePanelPostTypes from '../../hooks/use-accessible-panel-post-types';
import { useSiteContentStatusFilterCounts } from '../../hooks/use-site-content-status-filter-counts';
import {
	getSiteContentStatusFilterLabel,
	hasActiveSiteContentStatusFilters,
	shouldShowSiteContentStatusFilterRow,
	SITE_CONTENT_ALL_FILTER_LABEL,
	SITE_CONTENT_SELECTABLE_STATUS_FILTERS,
} from '../../site-content-status-filter';

const renderFilterMenuItemContent = ( label: string, selected: boolean ) => (
	<Stack alignItems="center" direction="row" gap={ 1 } width="100%">
		<Typography sx={ { color: 'text.secondary', flex: 1 } } variant="caption">
			{ label }
		</Typography>
		{ selected ? <CheckIcon aria-hidden fontSize="tiny" /> : null }
	</Stack>
);

type Props = {
	loadCounts: boolean;
};

export default function ContentPanelStatusFilterList( { loadCounts }: Props ) {
	const { clearStatusFilters, statusFilters, toggleStatusFilter } = useContentPanelCoordinator();
	const { accessiblePostTypes } = useAccessiblePanelPostTypes();
	const { data: statusCounts, isPending: isLoadingCounts } = useSiteContentStatusFilterCounts(
		accessiblePostTypes,
		loadCounts
	);

	const isAllSelected = ! hasActiveSiteContentStatusFilters( statusFilters );

	const visibleFilters = SITE_CONTENT_SELECTABLE_STATUS_FILTERS.filter( ( filter ) =>
		shouldShowSiteContentStatusFilterRow( statusCounts?.[ filter ], isLoadingCounts, statusFilters[ filter ] )
	);

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
			{ visibleFilters.map( ( filter ) => {
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
