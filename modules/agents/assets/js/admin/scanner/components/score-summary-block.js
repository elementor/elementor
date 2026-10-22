import { ArrowUpRightIcon, CircleCheckFilledIcon, InfoCircleIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import Infotip from '@elementor/ui/Infotip';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { SCANNER_COLORS, SCANNER_LAYOUT } from '../scanner-constants';
import { RESCAN_LAYOUT_SCORE_ROW, RescanControl, useNextScanLabel } from './rescan-control';
import { scannerButtonSx } from './scanner-button-sx';
import { ScoreRing } from './score-ring';

export { useNextScanLabel };

const WHERE_YOU_STAND_MAX = 39;
const GETTING_THERE_MAX = 69;
const IN_GOOD_SHAPE_MAX = 89;
const CLOCK_PAD = 2;
const HOURS_IN_HALF_DAY = 12;
const BANNER_BLOCK_GAP = '20px';
const PLAIN_BLOCK_GAP = '32px';
const BANNER_BLOCK_EXTRA_BOTTOM_SPACE = `${ SCANNER_LAYOUT.summaryBlockBottomSpace - SCANNER_LAYOUT.pageGap }px`;
const SCORE_TEXT_GAP = '32px';
const CHECKED_AT_TOOLTIP = __( 'Based on current checks (v3.4). Not a final grade — the standard is still forming.', 'elementor' );

const getScoreCopy = ( score ) => {
	if ( 'number' !== typeof score ) {
		return {
			heading: __( 'Rescan to get your score', 'elementor' ),
			description: __( 'Run a scan to see how ready your site is for agents.', 'elementor' ),
		};
	}

	if ( score <= WHERE_YOU_STAND_MAX ) {
		return {
			heading: __( 'Where you stand', 'elementor' ),
			description: __( 'Some of what agents need is already in place, but they can\'t yet read your prices or use your forms. Below is what to fix, with a prompt you can paste into any AI tool.', 'elementor' ),
		};
	}

	if ( score <= GETTING_THERE_MAX ) {
		return {
			heading: __( 'Getting there', 'elementor' ),
			description: __( 'Agents can use parts of your site, but several gaps still keep them from acting for your visitors. Below is what to fix, with a prompt you can paste into any AI tool.', 'elementor' ),
		};
	}

	if ( score <= IN_GOOD_SHAPE_MAX ) {
		return {
			heading: __( 'In good shape', 'elementor' ),
			description: __( 'Most of what agents need is in place. A few gaps still stop them from using everything your site offers. Below is what to fix, with a prompt you can paste into any AI tool.', 'elementor' ),
		};
	}

	return {
		heading: __( 'Leading the way', 'elementor' ),
		description: __( 'Agents can find, understand, and act on your site. Only small gaps remain. Below is what to fix, with a prompt you can paste into any AI tool.', 'elementor' ),
	};
};

const formatClock = ( date ) => {
	const hours = date.getHours();
	const minutes = String( date.getMinutes() ).padStart( CLOCK_PAD, '0' );
	const suffix = hours >= HOURS_IN_HALF_DAY ? 'pm' : 'am';
	const hour12 = hours % HOURS_IN_HALF_DAY || HOURS_IN_HALF_DAY;

	return `${ hour12 }:${ minutes } ${ suffix }`;
};

const formatCheckedAt = ( ranAt ) => {
	const date = new Date( ranAt );

	if ( Number.isNaN( date.getTime() ) ) {
		return '';
	}

	const time = formatClock( date );

	if ( date.toDateString() === new Date().toDateString() ) {
		return sprintf(
			/* Translators: %s: Time of day, such as 9:14 am. */
			__( 'Checked today at %s', 'elementor' ),
			time,
		);
	}

	return sprintf(
		/* Translators: %s: Date of the scan. */
		__( 'Checked on %s', 'elementor' ),
		date.toLocaleDateString(),
	);
};

export const ScoreSummaryBlock = ( { children, banner } ) => (
	<Stack gap={ banner ? BANNER_BLOCK_GAP : PLAIN_BLOCK_GAP } mb={ banner ? BANNER_BLOCK_EXTRA_BOTTOM_SPACE : 0 }>
		{ children }
		{ banner }
	</Stack>
);

ScoreSummaryBlock.propTypes = {
	children: PropTypes.node.isRequired,
	banner: PropTypes.node,
};

export const ScoreRow = ( {
	score,
	ringDurationMs,
	isDimmed,
	isActivated,
	isBusy,
	needsRescanForScore,
	siteDomain,
	ranAt,
	agentAccessUrl,
	retryAt,
	onRescan,
} ) => {
	const { heading, description } = getScoreCopy( score );
	const checkedAt = ranAt ? formatCheckedAt( ranAt ) : '';

	return (
		<Stack direction="row" alignItems="flex-start" gap={ SCORE_TEXT_GAP }>
			<ScoreRing score={ score } durationMs={ ringDurationMs } isDimmed={ isDimmed } />
			<Stack spacing={ 2 } flex={ 1 } minWidth={ 0 }>
				<Stack spacing={ 0 }>
					<Stack direction="row" alignItems="center" spacing={ 2 }>
						<Typography variant="h5" component="h3" color="text.primary">{ heading }</Typography>
						<RescanControl
							layout={ RESCAN_LAYOUT_SCORE_ROW }
							retryAt={ retryAt }
							onRescan={ onRescan }
							isBusy={ isBusy }
							isActivated={ isActivated }
						/>
					</Stack>
					{ isActivated && (
						<Stack direction="row" alignItems="center" spacing={ 1 }>
							<Stack direction="row" alignItems="center" spacing={ 0.5 }>
								<CircleCheckFilledIcon fontSize="tiny" sx={ { color: SCANNER_COLORS.accent } } />
								<Typography variant="body2" sx={ { color: SCANNER_COLORS.accent } }>
									{ __( 'Agent Ready is on', 'elementor' ) }
								</Typography>
							</Stack>
							<Button
								variant="text"
								color="primary"
								size="small"
								href={ agentAccessUrl }
								endIcon={ <ArrowUpRightIcon fontSize="tiny" /> }
								sx={ { ...scannerButtonSx.plainText, textDecoration: 'underline' } }
							>
								{ __( 'Settings', 'elementor' ) }
							</Button>
						</Stack>
					) }
					<Typography variant="body1" color="text.secondary">{ description }</Typography>
					{ needsRescanForScore && (
						<Typography variant="caption" color="text.tertiary">
							{ __( 'Rescan to update your score.', 'elementor' ) }
						</Typography>
					) }
				</Stack>
				{ checkedAt && (
					<Stack direction="row" alignItems="center" spacing={ 0.5 }>
						<Typography variant="caption" color="text.tertiary">
							{ `${ siteDomain } · ${ checkedAt }` }
						</Typography>
						<Infotip content={ CHECKED_AT_TOOLTIP }>
							<InfoCircleIcon fontSize="small" color="action" />
						</Infotip>
					</Stack>
				) }
			</Stack>
		</Stack>
	);
};

ScoreRow.propTypes = {
	score: PropTypes.number,
	ringDurationMs: PropTypes.number.isRequired,
	isDimmed: PropTypes.bool,
	isActivated: PropTypes.bool,
	isBusy: PropTypes.bool,
	needsRescanForScore: PropTypes.bool,
	siteDomain: PropTypes.string.isRequired,
	ranAt: PropTypes.string,
	agentAccessUrl: PropTypes.string.isRequired,
	retryAt: PropTypes.string,
	onRescan: PropTypes.func.isRequired,
};
