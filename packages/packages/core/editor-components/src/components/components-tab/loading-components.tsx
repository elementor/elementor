import * as React from 'react';
import { Box, Skeleton, Stack } from '@elementor/ui';

const ROWS = Array.from( { length: 3 }, ( _, index ) => index );

const STAGGER_DELAY_MS = 80;

export const LoadingComponents = () => {
	return (
		<Stack
			aria-label="Loading components"
			gap={ 1.5 }
			sx={ {
				pointerEvents: 'none',
				position: 'relative',
				maxHeight: '300px',
				overflow: 'hidden',
				px: 1,
				'&:after': {
					position: 'absolute',
					bottom: 0,
					content: '""',
					left: 0,
					width: '100%',
					height: '40%',
					pointerEvents: 'none',
					zIndex: 1,
				},
			} }
		>
			{ ROWS.map( ( row ) => (
				<Box
					key={ row }
					display="flex"
					alignItems="center"
					gap={ 1.5 }
					sx={ {
						py: 0.75,
						px: 1.5,
						opacity: 0,
						animation: `e-loading-fade-in 0.4s ease-out ${ row * STAGGER_DELAY_MS }ms forwards`,
						'@keyframes e-loading-fade-in': {
							from: { opacity: 0, transform: 'translateY(4px)' },
							to: { opacity: 1, transform: 'translateY(0)' },
						},
					} }
				>
					<Skeleton animation="wave" variant="rounded" width={ 24 } height={ 24 } />
					<Skeleton animation="wave" variant="rounded" width="60%" height={ 14 } />
				</Box>
			) ) }
		</Stack>
	);
};
