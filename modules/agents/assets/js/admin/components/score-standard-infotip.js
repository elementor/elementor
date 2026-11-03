import { useState } from 'react';
import { InfoCircleIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import CloseButton from '@elementor/ui/CloseButton';
import Infotip from '@elementor/ui/Infotip';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';

const SCORE_STANDARD_INFOTIP_WIDTH = 320;
const SCORE_STANDARD_TOOLTIP = __( 'Based on current standards. Score may change over time even if the site\'s content did not change', 'elementor' );

export const ScoreStandardInfotip = () => {
	const [ isOpen, setIsOpen ] = useState( false );

	const open = () => setIsOpen( true );
	const close = () => setIsOpen( false );

	return (
		<Infotip
			arrow
			open={ isOpen }
			placement="right"
			disableHoverListener
			disableFocusListener
			content={ (
				<Box position="relative" width={ SCORE_STANDARD_INFOTIP_WIDTH } boxSizing="border-box" p={ 2 }>
					<CloseButton
						aria-label={ __( 'Close', 'elementor' ) }
						onClick={ close }
						sx={ { position: 'absolute', top: 1, right: 1 } }
						slotProps={ { icon: { fontSize: 'tiny' } } }
					/>
					<Typography variant="body2" color="text.primary" pr={ 3 }>
						{ SCORE_STANDARD_TOOLTIP }
					</Typography>
				</Box>
			) }
			slotProps={ {
				popper: {
					onMouseEnter: open,
					onMouseLeave: close,
				},
			} }
		>
			<Box
				component="span"
				display="inline-flex"
				alignItems="center"
				onMouseEnter={ open }
				onMouseLeave={ close }
			>
				<InfoCircleIcon fontSize="small" color="action" />
			</Box>
		</Infotip>
	);
};
