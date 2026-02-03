import * as React from 'react';
import { Box, Button, styled } from '@elementor/ui';
import { ChevronLeftIcon, ChevronRightIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

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
	children?: React.ReactNode;
}

const StyledFooter = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: theme.spacing( 2, 3 ),
	position: 'absolute',
	bottom: 0,
	left: 0,
	right: 0,
	zIndex: 10,
	background: theme.palette.background.paper,
	borderTop: `1px solid ${ theme.palette.divider }`,
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

export function Footer( {
	showBack = true,
	showSkip = true,
	showContinue = true,
	backLabel,
	skipLabel,
	continueLabel,
	continueDisabled = false,
	continueLoading = false,
	onBack,
	onSkip,
	onContinue,
	children,
}: FooterProps ) {
	const handleBack = React.useCallback( () => {
		if ( onBack ) {
			onBack();
		}
	}, [ onBack ] );

	const handleSkip = React.useCallback( () => {
		if ( onSkip ) {
			onSkip();
		}
	}, [ onSkip ] );

	const handleContinue = React.useCallback( () => {
		if ( onContinue ) {
			onContinue();
		}
	}, [ onContinue ] );

	return (
		<StyledFooter component="footer">
			<LeftActions>
				{ showBack && (
					<Button
						variant="text"
						color="inherit"
						onClick={ handleBack }
						startIcon={ <ChevronLeftIcon /> }
						sx={ { color: 'text.secondary' } }
					>
						{ backLabel || __( 'Back', 'elementor' ) }
					</Button>
				) }
			</LeftActions>

			{ children }

			<RightActions>
				{ showSkip && (
					<Button
						variant="text"
						color="inherit"
						onClick={ handleSkip }
						sx={ { color: 'text.secondary' } }
					>
						{ skipLabel || __( 'Skip', 'elementor' ) }
					</Button>
				) }

				{ showContinue && (
					<Button
						variant="contained"
						color="primary"
						onClick={ handleContinue }
						disabled={ continueDisabled || continueLoading }
						endIcon={ ! continueLoading && <ChevronRightIcon /> }
						sx={ { minWidth: 120 } }
					>
						{ continueLoading
							? __( 'Loading...', 'elementor' )
							: continueLabel || __( 'Continue', 'elementor' ) }
					</Button>
				) }
			</RightActions>
		</StyledFooter>
	);
}

export default Footer;
