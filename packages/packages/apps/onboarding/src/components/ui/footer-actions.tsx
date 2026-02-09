import * as React from 'react';
import { ArrowLeftIcon } from '@elementor/icons';
import { Box, Button, styled } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const LeftActions = styled( Box )( {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
} );

const RightActions = styled( Box )( {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
} );

const BackButton = styled( Button )( ( { theme } ) => ( {
	color: theme.palette.text.primary,
	padding: theme.spacing( 0.75, 1 ),
	minHeight: 0,
	borderRadius: theme.shape.borderRadius,
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 14 ),
	fontWeight: 500,
	lineHeight: theme.typography.pxToRem( 24 ),
	letterSpacing: '0.4px',
	'&:hover': {
		backgroundColor: 'transparent',
	},
} ) );

const SkipButton = styled( Button )( ( { theme } ) => {
	const outlinedBorderColor = theme.palette.primary?.states?.outlinedBorder ?? theme.palette.divider;

	return {
		color: theme.palette.text.primary,
		borderColor: outlinedBorderColor,
		padding: theme.spacing( 0.75, 2 ),
		minHeight: 0,
		borderRadius: theme.shape.borderRadius,
		textTransform: 'none',
		fontSize: theme.typography.pxToRem( 14 ),
		fontWeight: 500,
		lineHeight: theme.typography.pxToRem( 24 ),
		letterSpacing: '0.4px',
		'&:hover': {
			backgroundColor: 'transparent',
			borderColor: outlinedBorderColor,
		},
	};
} );

const ContinueButton = styled( Button )( ( { theme } ) => ( {
	backgroundColor: theme.palette.primary.main,
	color: theme.palette.primary.contrastText,
	padding: theme.spacing( 0.75, 2 ),
	minHeight: 0,
	borderRadius: theme.shape.borderRadius,
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 14 ),
	fontWeight: 500,
	lineHeight: theme.typography.pxToRem( 24 ),
	letterSpacing: '0.4px',
	'&:hover': {
		backgroundColor: theme.palette.primary.main,
	},
} ) );

interface FooterActionsProps {
	showBack?: boolean;
	showSkip?: boolean;
	showContinue?: boolean;
	backLabel?: string;
	skipLabel?: string;
	continueLabel?: string;
	continueDisabled?: boolean;
	continueLoading?: boolean;
	onBack?: () => void;
	onSkip?: () => void;
	onContinue?: () => void;
}

export function FooterActions( {
	showBack = true,
	showSkip = true,
	showContinue = true,
	backLabel = __( 'Back', 'elementor' ),
	skipLabel = __( 'Skip', 'elementor' ),
	continueLabel = __( 'Continue', 'elementor' ),
	continueDisabled = false,
	continueLoading = false,
	onBack,
	onSkip,
	onContinue,
}: FooterActionsProps ) {
	return (
		<>
			<LeftActions>
				{ showBack && (
					<BackButton variant="text" onClick={ onBack } startIcon={ <ArrowLeftIcon fontSize="tiny" /> }>
						{ backLabel }
					</BackButton>
				) }
			</LeftActions>

			<RightActions>
				{ showSkip && (
					<SkipButton variant="outlined" onClick={ onSkip }>
						{ skipLabel }
					</SkipButton>
				) }

				{ showContinue && (
					<ContinueButton
						variant="contained"
						onClick={ onContinue }
						disabled={ continueDisabled || continueLoading }
					>
						{ continueLoading ? __( 'Loading…', 'elementor' ) : continueLabel }
					</ContinueButton>
				) }
			</RightActions>
		</>
	);
}
