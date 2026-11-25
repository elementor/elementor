import * as React from 'react';
import { PopoverBody, PopoverHeader } from '@elementor/editor-ui';
import { ArrowsSortIcon } from '@elementor/icons';
import { bindPopover, bindToggle, Divider, Popover, ToggleButton, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useSiteContentSectionToolbar } from '../../contexts/site-content-section-toolbar';
import { hasActiveSiteContentSort, SITE_CONTENT_SORT_POPOVER_WIDTH_PX } from '../../site-content-sort';
import ContentPanelClearFiltersButton from './content-panel-clear-filters-button';
import ContentPanelSortList from './content-panel-sort-list';

export default function ContentPanelSort() {
	const { clearSiteContentSort, siteContentSort } = useSiteContentSectionToolbar();
	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	const hasActiveSort = hasActiveSiteContentSort( siteContentSort );

	return (
		<>
			<Tooltip placement="top" title={ __( 'Sort', 'elementor' ) }>
				<ToggleButton
					aria-label={ __( 'Sort', 'elementor' ) }
					selected={ popupState.isOpen || hasActiveSort }
					size="tiny"
					value="sort"
					{ ...bindToggle( popupState ) }
				>
					<ArrowsSortIcon fontSize="tiny" />
				</ToggleButton>
			</Tooltip>
			<Popover
				anchorOrigin={ {
					horizontal: 'right',
					vertical: 'top',
				} }
				sx={ {
					maxWidth: `${ SITE_CONTENT_SORT_POPOVER_WIDTH_PX }px`,
				} }
				transformOrigin={ {
					horizontal: -21,
					vertical: 'top',
				} }
				{ ...bindPopover( popupState ) }
			>
				<PopoverHeader
					actions={
						hasActiveSort
							? [
									<ContentPanelClearFiltersButton
										ariaLabel={ __( 'Clear sort', 'elementor' ) }
										key="clear-sort"
										onClear={ clearSiteContentSort }
										tooltipText={ __( 'Clear sort', 'elementor' ) }
									/>,
							  ]
							: []
					}
					icon={ <ArrowsSortIcon fontSize="tiny" /> }
					onClose={ popupState.close }
					title={ __( 'Sort', 'elementor' ) }
				/>
				<Divider sx={ { borderWidth: '1px 0 0 0' } } />
				<PopoverBody height="auto" width={ SITE_CONTENT_SORT_POPOVER_WIDTH_PX }>
					<ContentPanelSortList />
				</PopoverBody>
			</Popover>
		</>
	);
}
