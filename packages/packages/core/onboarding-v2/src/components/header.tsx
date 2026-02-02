/**
 * Onboarding V2 Header Component
 *
 * Reusable header component for the onboarding wizard.
 * Displays the Elementor logo and optional close button.
 */

import * as React from 'react';
import { Box, IconButton, styled } from '@elementor/ui';
import { XIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

interface HeaderProps {
	/**
	 * Whether to show the close button.
	 */
	showCloseButton?: boolean;

	/**
	 * Callback when the close button is clicked.
	 */
	onClose?: () => void;

	/**
	 * Optional additional content to render in the header.
	 */
	children?: React.ReactNode;
}

const StyledHeader = styled( Box )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: theme.spacing( 2, 3 ),
	position: 'absolute',
	top: 0,
	left: 0,
	right: 0,
	zIndex: 10,
	background: 'transparent',
} ) );

const Logo = styled( 'svg' )( {
	width: 32,
	height: 32,
} );

const HeaderActions = styled( Box )( {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
} );

/**
 * Elementor Logo SVG component.
 */
function ElementorLogo() {
	return (
		<Logo viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM10.6667 9.33333H12V22.6667H10.6667V9.33333ZM14.6667 9.33333H21.3333V10.6667H14.6667V9.33333ZM21.3333 15.3333H14.6667V16.6667H21.3333V15.3333ZM14.6667 21.3333H21.3333V22.6667H14.6667V21.3333Z"
				fill="currentColor"
			/>
		</Logo>
	);
}

/**
 * Header component for the onboarding wizard.
 */
export function Header( { showCloseButton = true, onClose, children }: HeaderProps ) {
	const handleClose = React.useCallback( () => {
		if ( onClose ) {
			onClose();
		}
	}, [ onClose ] );

	return (
		<StyledHeader component="header">
			<Box sx={ { color: 'text.primary' } }>
				<ElementorLogo />
			</Box>

			<HeaderActions>
				{ children }

				{ showCloseButton && (
					<IconButton
						aria-label={ __( 'Close onboarding', 'elementor' ) }
						onClick={ handleClose }
						size="small"
						sx={ {
							color: 'text.secondary',
							'&:hover': {
								color: 'text.primary',
							},
						} }
					>
						<XIcon />
					</IconButton>
				) }
			</HeaderActions>
		</StyledHeader>
	);
}

export default Header;
