import * as React from 'react';
import { ReactNode } from 'react';
import { Stack, Typography } from '@elementor/ui';

type ModalHeaderProps = {
	title: string;
	subtitle: ReactNode;
};

export const ModalHeader = ( { title, subtitle }: ModalHeaderProps ) => {
	return (
		<Stack gap={ 1 }>
			<Typography variant="h4" color="text.primary" maxWidth={ 320 }>
				{ title }
			</Typography>
			<Typography variant="body2" color="text.primary">
				{ subtitle }
			</Typography>
		</Stack>
	);
};
