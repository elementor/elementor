import { AngieIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { SCANNER_COLORS, SCANNER_LAYOUT } from '../scanner-constants';
import { getMockScanResult } from '../scanner-mock-data';
import { getBaseScore, getVisibleChecks } from '../scanner-score';
import { FixesSection } from './fixes-section';
import { PassingTable } from './passing-table';
import { ScoreRow, ScoreSummaryBlock, useNextScanLabel } from './score-summary-block';
import { StageBars } from './stage-bars';

const HERO_COPY_MAX_WIDTH = 608;
const HERO_SECTION_GAP = 6;
const FEATURE_CARD_GAP = 0.5;
const PREVIEW_BLUR = '5px';
const PREVIEW_OPACITY = 0.5;
const PREVIEW_TOP_SPACE = '56px';
const PREVIEW_RING_DURATION_MS = 0;
const PAGE_INLINE_PADDING = '32px';

const noop = () => {};

const PREVIEW_FLOW = {
	openIds: {},
	resolvedIds: {},
	preferences: {},
	toggleRow: noop,
	openRow: noop,
	fixWithAngie: noop,
	setCheckEnabled: noop,
	undoFix: noop,
	startScan: noop,
	setPreference: noop,
	savePreference: noop,
	areChecksExpanded: false,
	toggleChecksExpanded: noop,
};

const getFeatureCards = () => [
	{
		title: __( 'Find the gaps', 'elementor' ),
		body: __( 'Learn what makes your site hard for AI agents to find, read and take action on.', 'elementor' ),
	},
	{
		title: __( 'Know exactly what to fix', 'elementor' ),
		body: __( 'Get a clear fix for each gap. Every issue comes with clear next steps, and many can be fixed right from your dashboard or via Angie.', 'elementor' ),
	},
	{
		title: __( 'Decide what agents can do', 'elementor' ),
		body: __( 'Control whether they can answer questions about you, and on what terms', 'elementor' ),
	},
];

const FeatureCard = ( { title, body } ) => (
	<Stack
		spacing={ FEATURE_CARD_GAP }
		flex={ 1 }
		p={ 3 }
		bgcolor={ SCANNER_COLORS.paper }
		border={ 1 }
		borderColor="divider"
		borderRadius={ SCANNER_LAYOUT.featureCardRadius }
		textAlign="left"
	>
		<Stack direction="row" alignItems="center" spacing={ FEATURE_CARD_GAP }>
			<AngieIcon fontSize="medium" sx={ { color: SCANNER_COLORS.accent } } />
			<Typography variant="subtitle1" color="text.secondary">{ title }</Typography>
		</Stack>
		<Typography variant="body2" color="text.tertiary">{ body }</Typography>
	</Stack>
);

FeatureCard.propTypes = {
	title: PropTypes.string.isRequired,
	body: PropTypes.string.isRequired,
};

const ScannerPreview = ( { agentAccessUrl, siteDomain } ) => {
	const scan = getMockScanResult();
	const score = getBaseScore( scan, true );

	return (
		<Box
			aria-hidden="true"
			inert=""
			pt={ PREVIEW_TOP_SPACE }
			sx={ {
				width: `calc(100% + (${ PAGE_INLINE_PADDING } * 2))`,
				paddingInline: PAGE_INLINE_PADDING,
				boxSizing: 'border-box',
				filter: `blur(${ PREVIEW_BLUR })`,
				opacity: PREVIEW_OPACITY,
				pointerEvents: 'none',
				userSelect: 'none',
			} }
		>
			<Stack gap={ `${ SCANNER_LAYOUT.pageGap }px` }>
				<ScoreSummaryBlock>
					<ScoreRow
						score={ score }
						ringDurationMs={ PREVIEW_RING_DURATION_MS }
						isActivated
						siteDomain={ siteDomain }
						ranAt={ scan.ranAt }
						agentAccessUrl={ agentAccessUrl }
						onRescan={ noop }
					/>
				</ScoreSummaryBlock>
				<StageBars stages={ scan.stages } />
				<FixesSection
					checks={ getVisibleChecks( scan, true ) }
					flow={ PREVIEW_FLOW }
					agentAccessUrl={ agentAccessUrl }
					isActivated
					score={ score }
				/>
				<PassingTable checks={ scan.passingChecks } />
			</Stack>
		</Box>
	);
};

ScannerPreview.propTypes = {
	agentAccessUrl: PropTypes.string.isRequired,
	siteDomain: PropTypes.string.isRequired,
};

export const FirstRunView = ( { agentAccessUrl, siteDomain, onStart, retryAt = null } ) => {
	const nextScanLabel = useNextScanLabel( retryAt );
	const isCoolingDown = '' !== nextScanLabel;

	return (
	<Stack alignItems="center" width="100%">
		<Stack alignItems="center" spacing={ HERO_SECTION_GAP } textAlign="center" width="100%">
			<Stack alignItems="center" spacing={ 1 }>
				<Typography variant="h4" component="h2" color="text.primary">
					{ __( 'Is your site ready for agents?', 'elementor' ) }
				</Typography>
				<Typography variant="body1" color="text.secondary" maxWidth={ HERO_COPY_MAX_WIDTH }>
					{ __( 'AI agents like those by ChatGPT and Claude now visit websites on behalf of people. Check how easily agents can reach, understand and take action on your site.', 'elementor' ) }
				</Typography>
			</Stack>
			<Button
				variant="contained"
				color="primary"
				size="large"
				onClick={ onStart }
				disabled={ isCoolingDown }
			>
				{ isCoolingDown ? nextScanLabel : __( 'Check my site', 'elementor' ) }
			</Button>
			<Stack direction="row" spacing={ 2 } width="100%" alignItems="stretch">
				{ getFeatureCards().map( ( card ) => (
					<FeatureCard key={ card.title } title={ card.title } body={ card.body } />
				) ) }
			</Stack>
		</Stack>
		<ScannerPreview agentAccessUrl={ agentAccessUrl } siteDomain={ siteDomain } />
	</Stack>
	);
};

FirstRunView.propTypes = {
	agentAccessUrl: PropTypes.string.isRequired,
	siteDomain: PropTypes.string.isRequired,
	onStart: PropTypes.func.isRequired,
	retryAt: PropTypes.string,
};
