import * as React from 'react';
import { Typography } from '@elementor/ui';

type Props = {
	index: number;
	value: React.ReactNode;
};

export const ValueComponent = ( { index, value }: Props ) => {
	return (
		<Typography
			variant="caption"
			color="text.tertiary"
			sx={ {
				mt: '1px',
				textDecoration: index === 0 ? 'none' : 'line-through',
				overflow: 'hidden',
				textOverflow: 'ellipsis',
				whiteSpace: 'nowrap',
			} }
		>
			{ value }
		</Typography>
	);
};
