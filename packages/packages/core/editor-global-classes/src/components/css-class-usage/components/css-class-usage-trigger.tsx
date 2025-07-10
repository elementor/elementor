import * as React from 'react';
import type { MouseEvent } from 'react';
import { CurrentLocationIcon, InfoCircleIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Box,
	Icon,
	IconButton,
	Infotip,
	Popover,
	Stack,
	styled,
	Tooltip,
	Typography,
	usePopupState,
} from '@elementor/ui';
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

	const tooltipText =
		total === 0 ? (
			<Infotip>
				<Stack gap={ 0.5 } flexDirection={ 'row' } py={ 1 } px={ 2 }>
					<Icon>
						<InfoCircleIcon fontSize={ 'small' } />
					</Icon>
					<Typography variant={ 'body2' }>
						{ __( 'This class isn’t being used yet.', 'elementor' ) }
					</Typography>
				</Stack>
			</Infotip>
		) : (
			`${ __( 'Locator', 'elementor' ) } (${ total })`
		);
	return (
		<>
			<Box position={ 'relative' }>
				<Tooltip disableInteractive={ ! total } placement={ 'top' } title={ tooltipText }>
					<CustomIconButton
						disabled={ total === 0 }
						size={ 'tiny' }
						sx={ {
							'&.Mui-disabled': {
								pointerEvents: 'auto',
								cursor: 'default',
							},
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
					</CustomIconButton>
				</Tooltip>
			</Box>
			<Box>
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
						cssClassID={ id }
					/>
				</Popover>
			</Box>
		</>
	);
};

const CustomIconButton = styled( IconButton )( ( { theme } ) => ( {
	'&.Mui-disabled': {
		pointerEvents: 'auto', // Enable hover
		'&:hover': {
			backgroundColor: 'rgba(0, 0, 0, 0.08)', // or any custom hover style
			color: theme.palette.action.disabled, // optional
		},
	},
} ) );
