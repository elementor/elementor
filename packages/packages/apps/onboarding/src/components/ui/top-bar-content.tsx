import * as React from 'react';
import { XIcon } from '@elementor/icons';
import { Button, IconButton, Stack, styled, useTheme } from '@elementor/ui';

import { t } from '../../utils/translations';
import { ElementorLogo } from './elementor-logo';

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
} ) );

const Divider = styled( 'div' )( ( { theme } ) => ( {
	width: 2,
	height: 20,
	backgroundColor: theme.palette.divider,
} ) );

interface TopBarContentProps {
	showUpgrade?: boolean;
	showClose?: boolean;
	onUpgrade?: () => void;
	onClose?: () => void;
}

export function TopBarContent( { showUpgrade = true, showClose = true, onUpgrade, onClose }: TopBarContentProps ) {
	const theme = useTheme();

	return (
		<>
			<ElementorLogo height={ 20 } />

			<Stack direction="row" alignItems="center" spacing={ 2 }>
				{ showUpgrade && (
					<UpgradeButton variant="contained" onClick={ onUpgrade }>
						{ t( 'common.upgrade' ) }
					</UpgradeButton>
				) }

				{ showClose && (
					<Stack direction="row" alignItems="center" spacing={ 1.5 }>
						<Divider />
						<IconButton
							aria-label={ t( 'common.close_onboarding' ) }
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
		</>
	);
}
