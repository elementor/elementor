import * as React from 'react';
import { BrushBigIcon } from '@elementor/icons';
import { IconButton, styled, Tooltip } from '@elementor/ui';

type ClearIconButtonProps = {
	onClick?: () => void;
	tooltipText: React.ReactNode;
	disabled?: boolean;
	size?: 'tiny' | 'small' | 'medium' | 'large';
};

const CustomIconButton = styled( IconButton )( ( { theme } ) => ( {
	width: theme.spacing( 2.5 ),
	height: theme.spacing( 2.5 ),
} ) );

export const ClearIconButton = ( { tooltipText, onClick, disabled, size = 'tiny' }: ClearIconButtonProps ) => (
	<Tooltip title={ tooltipText } placement="top" disableInteractive>
		<CustomIconButton aria-label={ tooltipText } size={ size } onClick={ onClick } disabled={ disabled }>
			<BrushBigIcon fontSize={ size } />
		</CustomIconButton>
	</Tooltip>
);
