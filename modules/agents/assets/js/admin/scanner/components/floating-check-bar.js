import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { SCANNER_COLORS, SCANNER_LAYOUT } from '../scanner-constants';
import { useNextScanLabel } from './rescan-control';

const FLOATING_BAR_Z_INDEX = 10;
const FLOATING_BAR_SHADOW = '0 4px 16px rgba(0, 0, 0, 0.16)';

export const FloatingCheckBar = ( { retryAt, onCheck } ) => {
	const nextScanLabel = useNextScanLabel( retryAt );
	const isCoolingDown = '' !== nextScanLabel;

	return (
		<Box position="sticky" bottom={ SCANNER_LAYOUT.floatingBarBottomOffset } zIndex={ FLOATING_BAR_Z_INDEX } display="flex" justifyContent="center" sx={ { pointerEvents: 'none' } }>
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				gap={ 2 }
				width={ SCANNER_LAYOUT.floatingBarWidth }
				maxWidth="100%"
				height={ SCANNER_LAYOUT.floatingBarHeight }
				px={ 2 }
				boxSizing="border-box"
				bgcolor={ SCANNER_COLORS.paper }
				borderRadius={ SCANNER_LAYOUT.cardRadius }
				boxShadow={ FLOATING_BAR_SHADOW }
				sx={ { pointerEvents: 'auto' } }
			>
				<Typography variant="body2" color="text.primary">
					{ __( 'See what AI says about your business.', 'elementor' ) }
				</Typography>
				<Button
					variant="contained"
					color="primary"
					size="small"
					onClick={ onCheck }
					disabled={ isCoolingDown }
				>
					{ isCoolingDown ? nextScanLabel : __( 'Check my site', 'elementor' ) }
				</Button>
			</Stack>
		</Box>
	);
};

FloatingCheckBar.propTypes = {
	retryAt: PropTypes.string,
	onCheck: PropTypes.func.isRequired,
};
