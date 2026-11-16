import { AlertTriangleFilledIcon, ReloadIcon } from '@elementor/icons';
import Alert from '@elementor/ui/Alert';
import AlertAction from '@elementor/ui/AlertAction';
import CircularProgress from '@elementor/ui/CircularProgress';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { SCANNER_COLORS } from '../scanner-constants';
import { useNextScanLabel } from './rescan-control';
import { scannerButtonSx } from './scanner-button-sx';

const SPINNER_SIZE = 14;

const warningAlertSx = {
	alignItems: 'center',
	backgroundColor: SCANNER_COLORS.banner,
	borderColor: SCANNER_COLORS.bannerBorder,
};

export const AgentAccessOffBanner = ( {
	retryAt,
	isBusy = false,
	isTurningOn = false,
	onRescan,
	onTurnBackOn,
} ) => {
	const nextScanLabel = useNextScanLabel( retryAt );
	const isCoolingDown = '' !== nextScanLabel;
	const rescanLabel = isCoolingDown ? nextScanLabel : __( 'Rescan now', 'elementor' );
	const isRescanDisabled = isBusy || isCoolingDown;

	return (
		<Alert
			severity="warning"
			variant="standard"
			icon={ <AlertTriangleFilledIcon sx={ { color: 'warning.main' } } /> }
			sx={ warningAlertSx }
			action={ (
				<>
					<AlertAction
						variant="outlined"
						color="secondary"
						size="small"
						onClick={ onRescan }
						disabled={ isRescanDisabled }
						startIcon={ <ReloadIcon /> }
					>
						{ rescanLabel }
					</AlertAction>
					<AlertAction
						variant="contained"
						size="small"
						onClick={ onTurnBackOn }
						disabled={ isTurningOn || isBusy }
						startIcon={ isTurningOn ? <CircularProgress size={ SPINNER_SIZE } color="inherit" /> : null }
						sx={ scannerButtonSx.activate }
					>
						{ isTurningOn ? __( 'Turning on', 'elementor' ) : __( 'Turn back on', 'elementor' ) }
					</AlertAction>
				</>
			) }
		>
			{ __( 'You turned off agent readiness settings. Turn them back on, or rescan to see your updated score.', 'elementor' ) }
		</Alert>
	);
};

AgentAccessOffBanner.propTypes = {
	retryAt: PropTypes.string,
	isBusy: PropTypes.bool,
	isTurningOn: PropTypes.bool,
	onRescan: PropTypes.func.isRequired,
	onTurnBackOn: PropTypes.func.isRequired,
};
