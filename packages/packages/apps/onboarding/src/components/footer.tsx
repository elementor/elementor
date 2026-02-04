import * as React from 'react';
import { ArrowLeftIcon } from '@elementor/icons';
import { Box, Button, styled } from '@elementor/ui';

const StyledFooter = styled( Box )( ( { theme } ) => ( {
	position: 'fixed',
	bottom: 0,
	left: 0,
	right: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: theme.spacing( 2, 3 ),
	background: theme.palette.background.paper,
	borderBottomLeftRadius: theme.shape.borderRadius * 1.5,
	borderBottomRightRadius: theme.shape.borderRadius * 1.5,
	boxShadow: theme.shadows[ 4 ],
	zIndex: theme.zIndex?.appBar || 1100,
} ) );

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
	'&:active': {
		backgroundColor: 'transparent',
	},
} ) );

const SkipButton = styled( Button )( ( { theme } ) => {
	const outlinedBorderColor =
		theme.palette.primary?.states?.outlinedBorder ?? theme.palette.divider;

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
		'&:active': {
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
	'&:active': {
		backgroundColor: theme.palette.primary.main,
	},
} ) );

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

interface FooterProps {
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

export function Footer( {
	showBack = true,
	showSkip = true,
	showContinue = true,
	backLabel = 'Back',
	skipLabel = 'Skip',
	continueLabel = 'Continue',
	continueDisabled = false,
	continueLoading = false,
	onBack,
	onSkip,
	onContinue,
}: FooterProps ) {
	return (
		<StyledFooter component="footer">
			<LeftActions>
				{ showBack && (
					<BackButton
						variant="text"
						onClick={ onBack }
						startIcon={ <ArrowLeftIcon fontSize="tiny" /> }
					>
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
						{ continueLoading ? 'Loading...' : continueLabel }
					</ContinueButton>
				) }
			</RightActions>
		</StyledFooter>
	);
}
