import * as React from 'react';
import { CheckIcon } from '@elementor/icons';
import { MenuItem, MenuList, Stack, Typography } from '@elementor/ui';

import { useSiteContentSectionToolbar } from '../../contexts/site-content-section-toolbar';
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
	const {
		clearStatusFilters,
		statusFilterCountSlugs,
		statusFilterCounts: presetStatusCounts,
		statusFilterCountsPending,
		statusFilters,
		toggleStatusFilter,
	} = useSiteContentSectionToolbar();
	const shouldLoadPostTypeCounts = loadCounts && statusFilterCountSlugs.length > 0 && ! presetStatusCounts;
	const { data: fetchedStatusCounts, isPending: isFetchingStatusCounts } = useSiteContentStatusFilterCounts(
		statusFilterCountSlugs,
		shouldLoadPostTypeCounts
	);
	const statusCounts = presetStatusCounts ?? fetchedStatusCounts;
	const isLoadingCounts = presetStatusCounts ? statusFilterCountsPending : isFetchingStatusCounts;

	const isAllSelected = ! hasActiveSiteContentStatusFilters( statusFilters );

	const visibleFilters =
		statusFilterCountSlugs.length === 0
			? SITE_CONTENT_SELECTABLE_STATUS_FILTERS
			: SITE_CONTENT_SELECTABLE_STATUS_FILTERS.filter( ( filter ) =>
					shouldShowSiteContentStatusFilterRow(
						statusCounts?.[ filter ],
						isLoadingCounts,
						statusFilters[ filter ]
					)
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
