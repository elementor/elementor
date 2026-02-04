import * as React from 'react';
import { XIcon } from '@elementor/icons';
import {
	Box,
	Button,
	IconButton,
	Stack,
	styled,
	useTheme,
} from '@elementor/ui';

import { ElementorLogo } from './elementor-logo';

const HEADER_HEIGHT = 40;

const HeaderContainer = styled( Box )( ( { theme } ) => ( {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	height: HEADER_HEIGHT,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	paddingLeft: 41,
	paddingRight: 16,
	background: theme.palette.background.paper,
	boxShadow: theme.shadows[ 1 ],
	zIndex: theme.zIndex?.appBar || 1100,
} ) );

const UpgradeButton = styled( Button )( ( { theme } ) => ( {
	backgroundColor: theme.palette.promotion.main,
	color: theme.palette.promotion.contrastText,
	padding: theme.spacing( 0.5, 1.25 ),
	minHeight: 0,
	borderRadius: 8,
	textTransform: 'none',
	fontSize: theme.typography.pxToRem( 13 ),
	fontWeight: 500,
	lineHeight: theme.typography.pxToRem( 22 ),
	letterSpacing: '0.46px',
	'&:hover': {
		backgroundColor: theme.palette.promotion.main,
	},
	'&:active': {
		backgroundColor: theme.palette.promotion.main,
	},
} ) );

const Divider = styled( 'div' )( ( { theme } ) => {
	const dividerColor = theme.palette.divider;

	return {
		width: 2,
		height: 20,
		backgroundColor: dividerColor,
	};
} );

interface HeaderProps {
	showCloseButton?: boolean;
	showUpgradeButton?: boolean;
	onClose?: () => void;
	onUpgrade?: () => void;
}

export function Header( {
	showCloseButton = true,
	showUpgradeButton = true,
	onClose,
	onUpgrade,
}: HeaderProps ) {
	const theme = useTheme();
	const logoColor = theme.palette.text.primary;
	const textColor = theme.palette.text.primary;

	return (
		<HeaderContainer component="header">
			<Box display="flex" alignItems="center">
				<ElementorLogo
					width={ 116 }
					height={ 20 }
					logoColor={ logoColor }
					textColor={ textColor }
				/>
			</Box>

			<Stack direction="row" alignItems="center" spacing={ 2 }>
				{ showUpgradeButton && (
					<UpgradeButton variant="contained" onClick={ onUpgrade }>
						Upgrade
					</UpgradeButton>
				) }

				{ showCloseButton && (
					<Stack direction="row" alignItems="center" spacing={ 1.5 }>
						<Divider />
						<IconButton
							aria-label="Close onboarding"
							onClick={ onClose }
							size="small"
							sx={ {
								color: theme.palette.text.secondary,
								padding: 0,
							} }
						>
							<XIcon fontSize="tiny" />
						</IconButton>
					</Stack>
				) }
			</Stack>
		</HeaderContainer>
	);
}
