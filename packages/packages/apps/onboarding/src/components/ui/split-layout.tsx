import * as React from 'react';
import type { ReactNode } from 'react';
import { Box, styled } from '@elementor/ui';

import type { ImageLayout, StepVisualConfig } from '../../types';
import { ProgressBar } from './progress-bar';
import { RightPanel } from './right-panel';

interface SplitLayoutRootProps {
	leftRatio: number;
	rightRatio: number;
}

interface ContentWrapperProps {
	contentMaxWidth: number;
}

interface ProgressInfo {
	currentStep: number;
	totalSteps: number;
}

interface SplitLayoutProps {
	left: ReactNode;
	rightConfig: StepVisualConfig;
	progress?: ProgressInfo;
}

/**
 * Layout ratios per Figma spec:
 *   wide  → 1:1 (left and right share space equally)
 *   narrow → 3:1 (left gets 3 parts, right gets 1 part)
 */
const LAYOUT_RATIOS: Record< ImageLayout, { left: number; right: number } > = {
	wide: { left: 1, right: 1 },
	narrow: { left: 3, right: 1 },
};

const LAYOUT_GAP = 4;
const LAYOUT_PADDING = 4;
const LAYOUT_PADDING_SM = 2.5;
const LAYOUT_TRANSITION_MS = 300;
const LEFT_PANEL_CONTENT_WIDTH = 386;
const LEFT_PANEL_PADDING_X = 80;
const LEFT_PANEL_PADDING_X_SM = 20;
const LEFT_PANEL_PADDING_TOP = 40;
const LEFT_PANEL_PADDING_TOP_SM = 20;
const LEFT_PANEL_GAP = 60;
const IMAGE_MIN_WIDTH = 464;
const CONTENT_IMAGE_MIN_GAP = 80;

const SplitLayoutRoot = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'leftRatio', 'rightRatio' ].includes( prop as string ),
} )< SplitLayoutRootProps >( ( { theme, leftRatio, rightRatio } ) => {
	const hideImageBreakpoint =
		LEFT_PANEL_CONTENT_WIDTH + LEFT_PANEL_PADDING_X * 2 + CONTENT_IMAGE_MIN_GAP + IMAGE_MIN_WIDTH + LAYOUT_GAP * 8;

	return {
		flex: 1,
		display: 'grid',
		gridTemplateColumns: `${ leftRatio }fr ${ rightRatio }fr`,
		gap: theme.spacing( LAYOUT_GAP ),
		padding: theme.spacing( LAYOUT_PADDING ),
		minHeight: 0,
		transition: `grid-template-columns ${ LAYOUT_TRANSITION_MS }ms ease`,
		[ theme.breakpoints.down( 'sm' ) ]: {
			padding: theme.spacing( LAYOUT_PADDING_SM ),
		},
		[ `@media (max-width: ${ hideImageBreakpoint }px)` ]: {
			gridTemplateColumns: '1fr',
			'& > *:last-child': {
				display: 'none',
			},
		},
	};
} );

const LeftPanel = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: LEFT_PANEL_GAP,
	padding: `${ LEFT_PANEL_PADDING_TOP }px ${ LEFT_PANEL_PADDING_X }px`,
	[ theme.breakpoints.down( 'sm' ) ]: {
		padding: `${ LEFT_PANEL_PADDING_TOP_SM }px ${ LEFT_PANEL_PADDING_X_SM }px`,
	},
} ) );

const ProgressBarWrapper = styled( Box )( () => ( {
	maxWidth: LEFT_PANEL_CONTENT_WIDTH,
	width: '100%',
} ) );

const ContentWrapper = styled( Box, {
	shouldForwardProp: ( prop ) => 'contentMaxWidth' !== prop,
} )< ContentWrapperProps >( ( { contentMaxWidth } ) => ( {
	maxWidth: contentMaxWidth,
	width: '100%',
} ) );

export function SplitLayout( { left, rightConfig, progress }: SplitLayoutProps ) {
	const ratio = LAYOUT_RATIOS[ rightConfig.imageLayout ] ?? LAYOUT_RATIOS.wide;
	const contentWidth = rightConfig.contentMaxWidth ?? LEFT_PANEL_CONTENT_WIDTH;

	return (
		<SplitLayoutRoot leftRatio={ ratio.left } rightRatio={ ratio.right }>
			<LeftPanel>
				{ progress && (
					<ProgressBarWrapper>
						<ProgressBar currentStep={ progress.currentStep } totalSteps={ progress.totalSteps } />
					</ProgressBarWrapper>
				) }
				<ContentWrapper contentMaxWidth={ contentWidth }>{ left }</ContentWrapper>
			</LeftPanel>
			<RightPanel config={ rightConfig } />
		</SplitLayoutRoot>
	);
}
