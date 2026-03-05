import * as React from 'react';
import { type MouseEvent, type PropsWithChildren } from 'react';
import { InfoAlert } from '@elementor/editor-ui';
import { CurrentLocationIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Box,
	IconButton,
	Infotip,
	Popover,
	styled,
	Tooltip,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCssClassUsageByID } from '../../../hooks/use-css-class-usage-by-id';
import { trackGlobalClasses } from '../../../utils/tracking';
import { type CssClassID } from '../types';
import { CssClassUsagePopover } from './css-class-usage-popover';

export const CssClassUsageTrigger = ( { id, onClick }: { id: CssClassID; onClick: ( id: CssClassID ) => void } ) => {
	const {
		data: { total },
		isLoading,
	} = useCssClassUsageByID( id );
	const cssClassUsagePopover = usePopupState( { variant: 'popover', popupId: 'css-class-usage-popover' } );

	if ( isLoading ) {
		return null;
	}

	const WrapperComponent = total !== 0 ? TooltipWrapper : InfoAlertMessage;

	const handleMouseEnter = () => {
		trackGlobalClasses( {
			event: 'classUsageHovered',
			classId: id,
			usage: total,
		} );
	};

	const handleClick = ( e: MouseEvent ) => {
		if ( total !== 0 ) {
			bindTrigger( cssClassUsagePopover ).onClick( e );
			onClick( id );
			trackGlobalClasses( {
				event: 'classUsageClicked',
				classId: id,
			} );
		}
	};

	return (
		<>
			<Box position={ 'relative' } onMouseEnter={ handleMouseEnter }>
				<WrapperComponent total={ total }>
					<CustomIconButton
						disabled={ total === 0 }
						size={ 'tiny' }
						{ ...bindTrigger( cssClassUsagePopover ) }
						onClick={ handleClick }
					>
						<CurrentLocationIcon fontSize={ 'tiny' } />
					</CustomIconButton>
				</WrapperComponent>
			</Box>
			<Box>
				<Popover
					anchorOrigin={ {
						vertical: 'center',
						horizontal: 'right',
					} }
					transformOrigin={ {
						vertical: 15,
						horizontal: -50,
					} }
					{ ...bindPopover( cssClassUsagePopover ) }
					onClose={ () => {
						bindPopover( cssClassUsagePopover ).onClose();
						onClick( '' );
					} }
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
			color: theme.palette.action.disabled, // optional
		},
	},
	height: '22px',
	width: '22px',
} ) );

const TooltipWrapper = ( { children, total }: PropsWithChildren< { total: number } > ) => (
	<Tooltip
		disableInteractive
		placement={ 'top' }
		title={ `${ __( 'Show {{number}} {{locations}}', 'elementor' )
			.replace( '{{number}}', total.toString() )
			.replace(
				'{{locations}}',
				total === 1 ? __( 'location', 'elementor' ) : __( 'locations', 'elementor' )
			) }` }
	>
		<span>{ children }</span>
	</Tooltip>
);

const InfoAlertMessage = ( { children }: PropsWithChildren ) => (
	<Infotip
		disableInteractive
		placement={ 'top' }
		color={ 'secondary' }
		content={ <InfoAlert sx={ { mt: 1 } }>{ __( 'This class isn’t being used yet.', 'elementor' ) }</InfoAlert> }
	>
		<span>{ children }</span>
	</Infotip>
);
