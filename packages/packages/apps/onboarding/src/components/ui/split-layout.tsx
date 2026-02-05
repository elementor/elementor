import * as React from 'react';
import type { ReactNode } from 'react';
import { Box, styled } from '@elementor/ui';

import type { StepVisualConfig } from '../../types';
import { ProgressBar } from './progress-bar';
import { RightPanel } from './right-panel';

const LAYOUT_GAP = 4;
const LAYOUT_PADDING = 4;
const LAYOUT_TRANSITION_MS = 300;
const MIN_RIGHT_RATIO = 0.3;
const MAX_RIGHT_RATIO = 0.6;
const DEFAULT_RIGHT_RATIO = 0.42;
const LEFT_PANEL_GAP = 60;
const LEFT_PANEL_PADDING_X = 80;
const LEFT_PANEL_PADDING_TOP = 40;

interface SplitLayoutRootProps {
	leftRatio: number;
	rightRatio: number;
}

const SplitLayoutRoot = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'leftRatio', 'rightRatio' ].includes( prop as string ),
} )< SplitLayoutRootProps >( ( { theme, leftRatio, rightRatio } ) => ( {
	flex: 1,
	display: 'grid',
	gridTemplateColumns: `${ leftRatio }fr ${ rightRatio }fr`,
	gap: theme.spacing( LAYOUT_GAP ),
	padding: theme.spacing( LAYOUT_PADDING ),
	minHeight: 0,
	transition: `grid-template-columns ${ LAYOUT_TRANSITION_MS }ms ease`,
	[ theme.breakpoints.down( 'md' ) ]: {
		gridTemplateColumns: '1fr',
		gridTemplateRows: 'auto auto',
	},
} ) );

const LeftPanel = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	flexDirection: 'column',
	gap: LEFT_PANEL_GAP,
	minWidth: 0,
	padding: `${ LEFT_PANEL_PADDING_TOP }px ${ LEFT_PANEL_PADDING_X }px`,
	[ theme.breakpoints.down( 'md' ) ]: {
		padding: theme.spacing( 4 ),
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

const clampRightRatio = ( ratio: number | undefined ) => {
	if ( typeof ratio !== 'number' || Number.isNaN( ratio ) ) {
		return DEFAULT_RIGHT_RATIO;
	}

	return Math.min( MAX_RIGHT_RATIO, Math.max( MIN_RIGHT_RATIO, ratio ) );
};

export function SplitLayout( { left, rightConfig, progress }: SplitLayoutProps ) {
	const rightRatio = clampRightRatio( rightConfig.rightWidthRatio );
	const leftRatio = 1 - rightRatio;

	return (
		<SplitLayoutRoot leftRatio={ leftRatio } rightRatio={ rightRatio }>
			<LeftPanel>
				{ progress && <ProgressBar currentStep={ progress.currentStep } totalSteps={ progress.totalSteps } /> }
				{ left }
			</LeftPanel>
			<RightPanel config={ rightConfig } />
		</SplitLayoutRoot>
	);
}
