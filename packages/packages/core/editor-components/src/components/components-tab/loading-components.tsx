import * as React from 'react';
import { Box, ListItemButton, Skeleton, Stack } from '@elementor/ui';
const ROWS_COUNT = 6;

const rows = Array.from( { length: ROWS_COUNT }, ( _, index ) => index );

export const LoadingComponents = () => {
	return (
		<Stack
			aria-label="Loading components"
			gap={ 1 }
			sx={ {
				pointerEvents: 'none',
				position: 'relative',
				maxHeight: '300px',
				overflow: 'hidden',
				'&:after': {
					position: 'absolute',
					top: 0,
					content: '""',
					left: 0,
					width: '100%',
					height: '300px',
					background: 'linear-gradient(to top, white, transparent)',
					pointerEvents: 'none',
				},
			} }
		>
			{ rows.map( ( row ) => (
				<ListItemButton
					key={ row }
					sx={ { border: 'solid 1px', borderColor: 'divider', py: 0.5, px: 1 } }
					shape="rounded"
				>
					<Box display="flex" gap={ 1 } width="100%">
						<Skeleton variant="text" width={ '24px' } height={ '36px' } />
						<Skeleton variant="text" width={ '100%' } height={ '36px' } />
					</Box>
				</ListItemButton>
			) ) }
		</Stack>
	);
};
