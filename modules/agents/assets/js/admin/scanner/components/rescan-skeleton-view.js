import Box from '@elementor/ui/Box';
import Skeleton from '@elementor/ui/Skeleton';
import Stack from '@elementor/ui/Stack';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { SCANNER_LAYOUT } from '../scanner-constants';
import { ActivateBanner } from './activate-banner';
import { FixesFilters } from './fixes-section';
const FILTER_ALL = 'all';
const SCORE_GAP = '32px';
const noop = () => {};

const BlockSkeleton = ( { width, height } ) => (
	<Skeleton variant="rounded" width={ width } height={ height } animation="wave" sx={ { bgcolor: 'action.hover' } } />
);

BlockSkeleton.propTypes = {
	width: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	height: PropTypes.number.isRequired,
};

const RingSkeleton = () => (
	<Skeleton
		variant="circular"
		width={ SCANNER_LAYOUT.ringSize }
		height={ SCANNER_LAYOUT.ringSize }
		animation="wave"
		sx={ { bgcolor: 'action.hover', flexShrink: 0 } }
	/>
);

export const RescanSkeletonView = ( { showBanner, agentAccessUrl } ) => (
	<Stack gap={ `${ SCANNER_LAYOUT.pageGap }px` } width="100%" aria-busy="true" aria-live="polite" role="status" aria-label={ __( 'Scanning again', 'elementor' ) }>
		<Stack direction="row" alignItems="flex-start" gap={ SCORE_GAP }>
			<RingSkeleton />
			<Stack spacing={ 2 } flex={ 1 } minWidth={ 0 } pt={ 0.5 }>
				<BlockSkeleton width={ SCANNER_LAYOUT.skeletonHeadingWidth } height={ SCANNER_LAYOUT.skeletonHeadingHeight } />
				<BlockSkeleton width="100%" height={ SCANNER_LAYOUT.skeletonBlockHeight } />
				<BlockSkeleton width={ SCANNER_LAYOUT.skeletonMetaWidth } height={ SCANNER_LAYOUT.skeletonBlockHeight } />
			</Stack>
		</Stack>
		{ showBanner && (
			<ActivateBanner isActivating onActivate={ noop } agentAccessUrl={ agentAccessUrl } />
		) }
		<Stack direction="row" gap={ 2 }>
			{ Array.from( { length: SCANNER_LAYOUT.skeletonRowCount }, ( _, index ) => (
				<Skeleton
					key={ index }
					variant="rounded"
					animation="wave"
					height={ SCANNER_LAYOUT.skeletonStageHeight }
					sx={ { flex: 1, borderRadius: SCANNER_LAYOUT.cardRadius, bgcolor: 'action.hover' } }
				/>
			) ) }
		</Stack>
		<Stack spacing={ 2 } pt={ 2 }>
			<Stack spacing={ 0.5 }>
				<BlockSkeleton width={ SCANNER_LAYOUT.skeletonSectionHeadingWidth } height={ SCANNER_LAYOUT.skeletonBlockHeight } />
				<BlockSkeleton width="100%" height={ SCANNER_LAYOUT.skeletonBlockHeight } />
			</Stack>
			<Box sx={ { pointerEvents: 'none' } }>
				<FixesFilters
					priority={ FILTER_ALL }
					stage={ FILTER_ALL }
					onPriorityChange={ noop }
					onStageChange={ noop }
					isDisabled
				/>
			</Box>
			{ Array.from( { length: SCANNER_LAYOUT.skeletonRowCount }, ( _, index ) => (
				<Skeleton
					key={ index }
					variant="rounded"
					animation="wave"
					height={ SCANNER_LAYOUT.skeletonRowHeight }
					sx={ { borderRadius: SCANNER_LAYOUT.cardRadius, bgcolor: 'action.hover' } }
				/>
			) ) }
		</Stack>
	</Stack>
);

RescanSkeletonView.propTypes = {
	showBanner: PropTypes.bool,
	agentAccessUrl: PropTypes.string.isRequired,
};
