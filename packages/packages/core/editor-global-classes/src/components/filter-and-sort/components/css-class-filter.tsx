import * as React from 'react';
import { PopoverBody, PopoverHeader } from '@elementor/editor-ui';
import { ClearIcon, FilterIcon } from '@elementor/icons';
import { bindPopover, bindToggle, IconButton, Popover, ToggleButton, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useFilterAndSortContext } from '../context';
import { ClearIconButton } from './clear-icon-button';
import { FilterList } from './filter-list';

export const CssClassFilter = () => {
	const popupState = usePopupState( {
		variant: 'popover',
		disableAutoFocus: true,
	} );

	return (
		<>
			<Tooltip title={ __( 'Filters', 'elementor' ) } placement="top">
				<ToggleButton value="filter" size="small" { ...bindToggle( popupState ) }>
					<FilterIcon fontSize="inherit" />
				</ToggleButton>
			</Tooltip>
			<Popover
				sx={ {
					maxWidth: '344px',
				} }
				anchorOrigin={ {
					vertical: 'top',
					horizontal: 'right',
				} }
				transformOrigin={ {
					vertical: 'top',
					horizontal: -21,
				} }
				{ ...bindPopover( popupState ) }
			>
				<PopoverHeader
					actions={ [
						<ClearIconButton key="clear-all-button" tooltipText={ __( 'Clear all', 'elementor' ) } />,
					] }
					onClose={ popupState.close }
					title={ __( 'Filters', 'elementor' ) }
					icon={ <FilterIcon /> }
				/>
				<PopoverBody width={ 344 } height={ 'auto' }>
					<FilterList />
				</PopoverBody>
			</Popover>
		</>
	);
};
