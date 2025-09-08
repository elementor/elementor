import { relative } from 'node:path';

import * as React from 'react';
import { hidden, white } from 'chalk';
import { ThemeProvider } from '@elementor/editor-ui';
import { Box, ListItem, ListItemButton, Skeleton, Stack, styled } from '@elementor/ui';
const ROW_HEIGHT = 40;
const ROWS_COUNT = 6;
const ROWS_HEIGHT = ROW_HEIGHT * ROWS_COUNT;

const rows = Array.from( { length: ROWS_COUNT }, ( _, index ) => index );

export const LoadingComponents = () => {
	return (
		<Stack
			id="elementor-loading-components"
			gap={ 1 }
			sx={ {
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
