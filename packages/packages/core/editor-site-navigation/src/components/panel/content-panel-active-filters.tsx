import * as React from 'react';
import { Chip, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useContentPanelCoordinator } from '../../contexts/content-panel-coordinator';
import {
  DEFAULT_SITE_CONTENT_SORT,
  getSiteContentSortLabel,
  hasActiveSiteContentSort,
} from '../../site-content-sort';
import {
  getActiveSiteContentStatusFilterKeys,
  getSiteContentStatusFilterLabel,
  hasActiveSiteContentStatusFilters,
} from '../../site-content-status-filter';
import ContentPanelClearFiltersButton from './content-panel-clear-filters-button';

const contentPanelFilterChipSx = {
  '& .MuiChip-deleteIcon': {
    display: 'none',
    transition: 'opacity 0.2s',
  },
  '&:hover .MuiChip-deleteIcon': {
    display: 'block',
  },
};

export default function ContentPanelActiveFilters() {
  const {
    clearActiveToolbarFilters,
    setSiteContentSort,
    siteContentSort,
    statusFilters,
    toggleStatusFilter,
  } = useContentPanelCoordinator();

  const hasStatusFilters = hasActiveSiteContentStatusFilters( statusFilters );
  const hasSort = hasActiveSiteContentSort( siteContentSort );

  if ( ! hasStatusFilters && ! hasSort ) {
    return null;
  }

  const activeKeys = getActiveSiteContentStatusFilterKeys( statusFilters );

  return (
    <Stack alignItems="center" direction="row" justifyContent="space-between">
      <Stack alignItems="center" direction="row" flexWrap="wrap" gap={ 0.5 }>
        { hasSort && (
          <Chip
            label={ getSiteContentSortLabel( siteContentSort ) }
            onDelete={ () => setSiteContentSort( DEFAULT_SITE_CONTENT_SORT ) }
            size="tiny"
            sx={ contentPanelFilterChipSx }
          />
        ) }
        { activeKeys.map( ( key ) => (
          <Chip
            key={ key }
            label={ getSiteContentStatusFilterLabel( key ) }
            onDelete={ () => toggleStatusFilter( key ) }
            size="tiny"
            sx={ contentPanelFilterChipSx }
          />
        ) ) }
      </Stack>
      <ContentPanelClearFiltersButton
        ariaLabel={ __( 'Clear Filters', 'elementor' ) }
        onClear={ clearActiveToolbarFilters }
        sx={ { margin: '0 0 auto auto' } }
        tooltipText={ __( 'Clear Filters', 'elementor' ) }
      />
    </Stack>
  );
}
