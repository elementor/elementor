import * as React from 'react';
import { Box, ToggleButton, type ToggleButtonProps, Tooltip } from '@elementor/ui';

type ToolbarMenuToggleItemProps = Omit< ToggleButtonProps, 'onChange' > & {
	title?: string;
	onClick?: () => void;
};

export default function ToolbarMenuToggleItem( { title, onClick, ...props }: ToolbarMenuToggleItemProps ) {
	return (
		<Tooltip title={ title }>
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span" aria-label={ undefined }>
				<ToggleButton
					{ ...props }
					onChange={ onClick }
					aria-label={ title }
					size="small"
					sx={ {
						border: 0, // Temp fix until the style of the ToggleButton component will be decided.
						'&.Mui-disabled': {
							border: 0, // Temp fix until the style of the ToggleButton component will be decided.
						},
						'& svg': {
							fontSize: '1.25rem',
							height: '1em',
							width: '1em',
						},
					} }
				/>
			</Box>
		</Tooltip>
	);
}
