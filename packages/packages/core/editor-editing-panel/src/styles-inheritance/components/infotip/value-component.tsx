import * as React from 'react';
import { Tooltip, Typography } from '@elementor/ui';

type Props = {
	index: number;
	value: React.ReactNode;
};

export const ValueComponent = ( { index, value }: Props ) => {
	return (
		<Tooltip title={ value } placement="top">
			<Typography
				variant="caption"
				color="text.tertiary"
				sx={ {
					mt: '1px',
					textDecoration: index === 0 ? 'none' : 'line-through',
					overflow: 'hidden',
					display: '-webkit-box',
					WebkitLineClamp: 1,
					WebkitBoxOrient: 'vertical',
					pl: 2.5,
					minWidth: 0,
					maxWidth: '100%',
				} }
			>
				{ value }
			</Typography>
		</Tooltip>
	);
};
