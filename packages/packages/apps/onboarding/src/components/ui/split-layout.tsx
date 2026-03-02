import * as React from 'react';
import type { ReactNode } from 'react';
import { Box, styled } from '@elementor/ui';

import type { StepVisualConfig } from '../../types';
import { ProgressBar } from './progress-bar';
import { RightPanel } from './right-panel';

const LAYOUT_GAP = 4;
const LAYOUT_PADDING = 4;
const LAYOUT_TRANSITION_MS = 300;
const LEFT_PANEL_CONTENT_WIDTH = 386;
const LEFT_PANEL_PADDING_X = 80;
const LEFT_PANEL_PADDING_TOP = 40;
const LEFT_PANEL_GAP = 32;
const IMAGE_MIN_WIDTH = 464;
const CONTENT_IMAGE_MIN_GAP = 80;

const SplitLayoutRoot = styled( Box )( ( { theme } ) => {
	const hideImageBreakpoint =
		LEFT_PANEL_CONTENT_WIDTH + LEFT_PANEL_PADDING_X * 2 + CONTENT_IMAGE_MIN_GAP + IMAGE_MIN_WIDTH + LAYOUT_GAP * 8;

	return {
		flex: 1,
		display: 'grid',
		gridTemplateColumns: `2fr 1fr`,
		gap: theme.spacing( LAYOUT_GAP ),
		padding: theme.spacing( LAYOUT_PADDING ),
		minHeight: 0,
		transition: `grid-template-columns ${ LAYOUT_TRANSITION_MS }ms ease`,
		[ `@media (max-width: ${ hideImageBreakpoint }px)` ]: {
			gridTemplateColumns: '1fr',
			'& > *:last-child': {
				display: 'none',
			},
		},
	};
} );

interface LeftPanelProps {
	contentMaxWidth: number;
}

const LeftPanel = styled( Box, {
	shouldForwardProp: ( prop ) => 'contentMaxWidth' !== prop,
} )< LeftPanelProps >( ( { theme, contentMaxWidth } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: LEFT_PANEL_GAP,
	padding: `${ LEFT_PANEL_PADDING_TOP }px ${ LEFT_PANEL_PADDING_X }px`,
	'& > *': {
		width: '100%',
	},
	'& > *:last-of-type': {
		maxWidth: contentMaxWidth,
	},
	[ theme.breakpoints.down( 'sm' ) ]: {
		padding: 0,
		gap: LEFT_PANEL_GAP / 2,
		'& > *': {
			maxWidth: 'none',
		},
	},
} ) );

interface ProgressInfo {
	currentStep: number;
	totalSteps: number;
}

interface SplitLayoutProps {
	left: ReactNode;
	rightConfig: StepVisualConfig;
	progress?: ProgressInfo;
}

export function SplitLayout( { left, rightConfig, progress }: SplitLayoutProps ) {
	const contentMaxWidth = rightConfig.contentMaxWidth ?? LEFT_PANEL_CONTENT_WIDTH;

	return (
		<SplitLayoutRoot>
			<LeftPanel contentMaxWidth={ contentMaxWidth }>
				{ progress && (
					<Box sx={ { maxWidth: LEFT_PANEL_CONTENT_WIDTH, width: '100%' } }>
						<ProgressBar currentStep={ progress.currentStep } totalSteps={ progress.totalSteps } />
					</Box>
				) }
				{ left }
			</LeftPanel>
			<RightPanel config={ rightConfig } />
		</SplitLayoutRoot>
	);
}
