import * as React from 'react';
import type { MouseEvent } from 'react';
import { CurrentLocationIcon, Loader2Icon } from '@elementor/icons';
import { bindPopover, bindTrigger, Box, IconButton, Popover, Tooltip, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCssClassUsageByID } from '../hooks';
import { type CssClassID } from '../types';
import { CssClassUsagePopover } from './css-class-usage-popover';

export const CssClassUsageTrigger = ( { id }: { id: CssClassID } ) => {
	const { data, isLoading } = useCssClassUsageByID( id );
	const { total } = data;
	const cssClassUsagePopover = usePopupState( { variant: 'popover', popupId: 'css-class-usage-popover' } );

	if ( isLoading ) {
		return <Loader2Icon aria-label={ 'loading' } />;
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
						aria-describedby={ 'css-class-usage-popover' }
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
