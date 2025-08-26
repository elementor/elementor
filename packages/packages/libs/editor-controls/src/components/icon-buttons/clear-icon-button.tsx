import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { IconButton, Tooltip, Paper, styled, type SxProps, type Theme } from '@elementor/ui';

type ClearIconButtonProps = {
	onClick?: () => void;
	tooltipText: React.ReactNode;
	disabled?: boolean;
	size?: 'tiny' | 'small' | 'medium' | 'large';
};

const CustomIconButton = styled( IconButton )( ( { theme } ) => ( {
	width: '20px',
	height: '20px',

	'&.Mui-disabled': {
		pointerEvents: 'auto',
		'&:hover': {
			color: theme.palette.action.disabled,
		},
	},
} ) );

const ButtonWrapper = styled( Paper )( {
	borderRadius: '20px',
	width: '36px',
	height: '24px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
} );

export const ClearIconButton = ( { tooltipText, onClick, disabled, size = 'tiny' }: ClearIconButtonProps ) => (
	<Tooltip title={ tooltipText } placement="top" disableInteractive>
		<ButtonWrapper>
			<CustomIconButton aria-label={ tooltipText } size={ size } onClick={ onClick } disabled={ disabled }>
				<BrushBigIcon fontSize={size} />
			</CustomIconButton>
		</ButtonWrapper>
	</Tooltip>
);


