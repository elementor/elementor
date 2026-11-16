import * as React from 'react';
import { type ElementType } from 'react';
import { Box, IconButton, Tooltip } from '@elementor/ui';

export type Props = {
	title: string;
	id?: string;
	icon: ElementType;
	selected?: boolean;
	disabled?: boolean;
	visible?: boolean;
	onClick?: () => void;
};

export default function Action( { icon: Icon, title, selected, visible = true, ...props }: Props ) {
	if ( ! visible ) {
		return null;
	}

	return (
		<Tooltip title={ title } placement="right">
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span">
				<IconButton
					{ ...props }
					aria-label={ title }
					aria-pressed={ selected }
					size="medium"
					sx={ { color: selected ? 'primary.main' : 'grey.800' } }
				>
					<Icon />
				</IconButton>
			</Box>
		</Tooltip>
	);
}
