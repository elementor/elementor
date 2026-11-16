import { AlertCircleIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { SCAN_FAILURE_REASON_BLOCKED, SCAN_FAILURE_REASON_LOCAL, SCANNER_COLORS, SCANNER_LAYOUT } from '../scanner-constants';
import { RESCAN_LAYOUT_ERROR_SUMMARY, RescanControl } from './rescan-control';

const ALERT_ICON_SIZE = 24;
const LIST_INDENT = '21px';

const getUnreachableTitle = ( siteDomain ) => sprintf(
	/* Translators: %s: Site domain. */
	__( 'We couldn\'t reach %s', 'elementor' ),
	siteDomain,
);

// TODO: Add copy for the other outside-scan failure reasons (maintenance, password, dns, timeout, throttled) once the endpoint returns them; only "blocked" and "local" are designed.
const getFailureCopy = ( reason, siteDomain ) => {
	if ( SCAN_FAILURE_REASON_LOCAL === reason ) {
		return {
			title: __( 'Your site isn\'t public yet', 'elementor' ),
			description: __( 'We check a site the way an AI assistant would — by visiting it from the outside. This one only runs on your computer, so those checks will run the day it goes live. Everything below we could read from inside WordPress.', 'elementor' ),
			steps: [
				__( 'Switch the basics on now. They\'ll be in place the moment you publish.', 'elementor' ),
				__( 'Come back and run the check once the site is live, to see the outside half.', 'elementor' ),
			],
		};
	}

	if ( SCAN_FAILURE_REASON_BLOCKED === reason ) {
		return {
			title: getUnreachableTitle( siteDomain ),
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
		title: getUnreachableTitle( siteDomain ),
		description: __( 'Something stopped us from loading your site from outside. Your score will appear once we can.', 'elementor' ),
		steps: [
			__( 'Activate Agent Ready anyway. Everything it sets up runs on your own server.', 'elementor' ),
			__( 'Rescan in a few minutes.', 'elementor' ),
		],
	};
};

export const ErrorReportCard = ( { siteDomain, reason, retryAt, onRescan, isActivated = false } ) => {
	const { title, description, steps } = getFailureCopy( reason, siteDomain );

	return (
		<Stack spacing={ 2.5 }>
			<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
				<Stack spacing={ 0 } flex={ 1 } minWidth={ 0 }>
					<Stack direction="row" alignItems="center" spacing={ 1 }>
						<AlertCircleIcon color="error" sx={ { fontSize: ALERT_ICON_SIZE } } />
						<Typography variant="h6" component="h3" color="text.primary">
							{ title }
						</Typography>
					</Stack>
					<Typography variant="body2" color="text.secondary">{ description }</Typography>
				</Stack>
				<Box flexShrink={ 0 }>
					<RescanControl
						layout={ RESCAN_LAYOUT_ERROR_SUMMARY }
						retryAt={ retryAt }
						onRescan={ onRescan }
						isActivated={ isActivated }
					/>
				</Box>
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
	retryAt: PropTypes.string,
	onRescan: PropTypes.func.isRequired,
	isActivated: PropTypes.bool,
};
