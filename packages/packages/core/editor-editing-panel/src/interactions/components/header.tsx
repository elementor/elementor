import * as React from 'react';
import { PlusIcon } from '@elementor/icons';
import { IconButton, Stack, Typography } from '@elementor/ui';

export const Header = ( { label }: { label: string } ) => {
	return (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="space-between"
			gap={ 1 }
			sx={ { marginInlineEnd: -0.75, py: 0.25 } }
		>
			<Typography component="label" variant="caption" color="text.secondary" sx={ { lineHeight: 1 } }>
				{ label }
			</Typography>
			<IconButton size="tiny" disabled>
				<PlusIcon fontSize="tiny" />
			</IconButton>
		</Stack>
	);
};
//nami
