import { AlertCircleIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { SCAN_FAILURE_REASON_BLOCKED, SCANNER_COLORS, SCANNER_LAYOUT } from '../scanner-constants';

const ALERT_ICON_SIZE = 24;
const LIST_INDENT = '21px';

// TODO: Add copy for the other outside-scan failure reasons (local, maintenance, password, dns, timeout, throttled) once the endpoint returns them; only "blocked" is designed.
const getFailureCopy = ( reason, siteDomain ) => {
	if ( SCAN_FAILURE_REASON_BLOCKED === reason ) {
		return {
			description: sprintf(
				/* Translators: %s: Site domain. */
				__( 'A firewall or security plugin on %s turned our scanner away, so we couldn\'t see your site the way an agent does. Your score will appear once we can.', 'elementor' ),
				siteDomain,
			),
			steps: [
				__( 'Activate Agent Ready anyway. Everything it sets up runs on your own server.', 'elementor' ),
				__( 'Ask your host or security plugin to allow the Elementor scanner.', 'elementor' ),
				__( 'Rescan once access is allowed.', 'elementor' ),
			],
		};
	}

	return {
		description: __( 'Something stopped us from loading your site from outside. Your score will appear once we can.', 'elementor' ),
		steps: [
			__( 'Activate Agent Ready anyway. Everything it sets up runs on your own server.', 'elementor' ),
			__( 'Rescan in a few minutes.', 'elementor' ),
		],
	};
};

export const ErrorReportCard = ( { siteDomain, reason } ) => {
	const { description, steps } = getFailureCopy( reason, siteDomain );

	return (
		<Stack spacing={ 2.5 }>
			<Stack spacing={ 0 }>
				<Stack direction="row" alignItems="center" spacing={ 1 }>
					<AlertCircleIcon color="error" sx={ { fontSize: ALERT_ICON_SIZE } } />
					<Typography variant="h6" component="h3" color="text.primary">
						{ sprintf(
							/* Translators: %s: Site domain. */
							__( 'We couldn\'t reach %s', 'elementor' ),
							siteDomain,
						) }
					</Typography>
				</Stack>
				<Typography variant="body2" color="text.secondary">{ description }</Typography>
			</Stack>
			<Box
				pt={ 1 }
				px={ 3 }
				pb={ 3 }
				bgcolor={ SCANNER_COLORS.paper }
				border={ 1 }
				borderColor="divider"
				borderRadius={ SCANNER_LAYOUT.cardRadius }
			>
				<Typography variant="overline" color="text.tertiary">{ __( 'What you can do now', 'elementor' ) }</Typography>
				<Box component="ol" m={ 0 } pl={ LIST_INDENT }>
					{ steps.map( ( step, index ) => (
						<Typography key={ step } component="li" variant="body2" color="text.secondary" mb={ 0 === index ? 1 : 0 }>
							{ step }
						</Typography>
					) ) }
				</Box>
			</Box>
		</Stack>
	);
};

ErrorReportCard.propTypes = {
	siteDomain: PropTypes.string.isRequired,
	reason: PropTypes.string,
};
