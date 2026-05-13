import * as React from 'react';
import { LinearProgress, styled } from '@elementor/ui';

const StyledLinearProgress = styled( LinearProgress )( ( { theme } ) => ( {
	height: 4,
	borderRadius: 22,
	backgroundColor: theme.palette.action.hover,
	'& .MuiLinearProgress-bar': {
		borderRadius: 22,
		backgroundColor: theme.palette.text.primary,
	},
} ) );

interface ProgressBarProps {
	currentStep: number;
	totalSteps: number;
}

export function ProgressBar( { currentStep, totalSteps }: ProgressBarProps ) {
	const progress = totalSteps > 0 ? ( ( currentStep + 1 ) / totalSteps ) * 100 : 0;

	return <StyledLinearProgress variant="determinate" value={ progress } />;
}
