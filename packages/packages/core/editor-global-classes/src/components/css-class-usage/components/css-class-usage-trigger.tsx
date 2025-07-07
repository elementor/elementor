import * as React from 'react';
import type { MouseEvent } from 'react';
import { CurrentLocationIcon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, IconButton, Popover, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCssClassUsageByID } from '../hooks';
import { type CssClassID } from '../types';
import { CssClassUsagePopover } from './css-class-usage-popover';

export const CssClassUsageTrigger = ( { id }: { id: CssClassID | string } ) => {
	const {
		data: { total },
		isLoading,
	} = useCssClassUsageByID( id );
	const cssClassUsagePopover = usePopupState( { variant: 'popover', popupId: 'css-class-usage-popover' } );

	if ( isLoading ) {
		return null;
	}

	return (
		<>
			<Box position={ 'relative' }>
				<Tooltip
					disableInteractive={ ! total }
					placement={ 'top' }
					title={ `${ __( 'Locator', 'elementor' ) } (${ total })` }
				>
					<IconButton
						size={ 'tiny' }
						sx={ {
							height: '22px',
							width: '22px',
						} }
						{ ...bindTrigger( cssClassUsagePopover ) }
						onClick={ ( e: MouseEvent ) => {
							if ( total !== 0 ) {
								bindTrigger( cssClassUsagePopover ).onClick( e );
							}
						} }
					>
						<CurrentLocationIcon fontSize={ 'tiny' } />
					</IconButton>
				</Tooltip>
			</Box>
			<Box
				sx={ {
					background: 'green',
				} }
			>
				<Popover
					sx={ { ml: 6 } }
					anchorOrigin={ {
						vertical: 'center',
						horizontal: 'right',
					} }
					transformOrigin={ {
						vertical: 'top',
						horizontal: -20,
					} }
					{ ...bindPopover( cssClassUsagePopover ) }
				>
					<CssClassUsagePopover
						onClose={ cssClassUsagePopover.close }
						aria-label="css-class-usage-popover"
						cssClassID={ id || '0' }
					/>
				</Popover>
			</Box>
		</>
	);
};
