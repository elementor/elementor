import * as React from 'react';
import { PopoverBody, PopoverHeader } from '@elementor/editor-ui';
import { FilterIcon } from '@elementor/icons';
import { bindPopover, bindToggle, Divider, Popover, ToggleButton, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

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
				<ToggleButton
					value="filter"
					size={ 'tiny' }
					selected={ popupState.isOpen }
					{ ...bindToggle( popupState ) }
				>
					<FilterIcon fontSize="tiny" />
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
						<ClearIconButton
							key="clear-all-button"
							tooltipText={ __( 'Clear all', 'elementor' ) }
							disabled={ false }
						/>,
					] }
					onClose={ popupState.close }
					title={ __( 'Filters', 'elementor' ) }
					icon={ <FilterIcon /> }
				/>
				<Divider
					sx={ {
						borderWidth: '1px 0 0 0',
					} }
				/>
				<PopoverBody width={ 344 } height={ 125 }>
					<FilterList />
				</PopoverBody>
			</Popover>
		</>
	);
};
