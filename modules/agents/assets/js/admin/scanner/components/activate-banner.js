import { ArrowUpRightIcon } from '@elementor/icons';
import Alert from '@elementor/ui/Alert';
import Button from '@elementor/ui/Button';
import CircularProgress from '@elementor/ui/CircularProgress';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { SCANNER_COLORS, SCANNER_LAYOUT } from '../scanner-constants';
import { scannerButtonSx } from './scanner-button-sx';

const SPINNER_SIZE = 14;

export const ActivateBanner = ( { isActivating, onActivate, agentAccessUrl, error } ) => (
	<Stack spacing={ 1 }>
		<Stack
			direction="row"
			alignItems="flex-end"
			justifyContent="space-between"
			spacing={ 2.5 }
			width="100%"
			p={ 2.5 }
			bgcolor={ SCANNER_COLORS.banner }
			border={ 1 }
			borderColor={ SCANNER_COLORS.bannerBorder }
			borderRadius={ SCANNER_LAYOUT.cardRadius }
			boxSizing="border-box"
		>
			<Stack spacing={ 1 } flex={ 1 } minWidth={ 0 }>
				<Typography variant="subtitle1" color="text.primary">{ __( 'Prepare your site for agents', 'elementor' ) }</Typography>
				<Stack spacing={ 0 }>
					<Typography variant="body2" color="text.secondary">
						{ __( 'Turn on the core agent readiness settings in one step, which should significantly improve your score. You can change each one anytime.', 'elementor' ) }
					</Typography>
					<Button
						variant="text"
						color="primary"
						size="small"
						href={ agentAccessUrl }
						endIcon={ <ArrowUpRightIcon fontSize="tiny" /> }
						sx={ { ...scannerButtonSx.plainText, alignSelf: 'flex-start', textDecoration: 'underline' } }
					>
						{ __( 'Open agent readiness settings', 'elementor' ) }
					</Button>
				</Stack>
			</Stack>
			<Button
				variant="contained"
				size="medium"
				onClick={ onActivate }
				disabled={ isActivating }
				startIcon={ isActivating ? <CircularProgress size={ SPINNER_SIZE } color="inherit" /> : null }
				sx={ { ...scannerButtonSx.activate, flexShrink: 0 } }
			>
				{ isActivating ? __( 'Activating', 'elementor' ) : __( 'Turn settings on', 'elementor' ) }
			</Button>
		</Stack>
		{ error && <Alert severity="error" size="small">{ error }</Alert> }
	</Stack>
);

ActivateBanner.propTypes = {
	isActivating: PropTypes.bool,
	onActivate: PropTypes.func.isRequired,
	agentAccessUrl: PropTypes.string.isRequired,
	error: PropTypes.string,
};
