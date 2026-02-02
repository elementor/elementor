/**
 * Onboarding V2 Footer Component
 *
 * Reusable footer component for the onboarding wizard.
 * Provides navigation buttons: Back, Skip, and Continue.
 */

import * as React from 'react';
import { Box, Button, styled } from '@elementor/ui';
import { ChevronLeftIcon, ChevronRightIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

interface FooterProps {
	/**
	 * Whether to show the back button.
	 */
	showBack?: boolean;

	/**
	 * Whether to show the skip button.
	 */
	showSkip?: boolean;

	/**
	 * Whether to show the continue button.
	 */
	showContinue?: boolean;

	/**
	 * Custom label for the back button.
	 */
	backLabel?: string;

	/**
	 * Custom label for the skip button.
	 */
	skipLabel?: string;

	/**
	 * Custom label for the continue button.
	 */
	continueLabel?: string;

	/**
	 * Whether the continue button should be disabled.
	 */
	continueDisabled?: boolean;

	/**
	 * Whether the continue button is in loading state.
	 */
	continueLoading?: boolean;

	/**
	 * Callback when the back button is clicked.
	 */
	onBack?: () => void;

	/**
	 * Callback when the skip button is clicked.
	 */
	onSkip?: () => void;

	/**
	 * Callback when the continue button is clicked.
	 */
	onContinue?: () => void;

	/**
	 * Optional additional content to render in the footer.
	 */
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

/**
 * Footer component for the onboarding wizard.
 */
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
