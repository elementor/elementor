import * as React from 'react';
import { type ReactNode } from 'react';
import { Stack, Typography } from '@elementor/ui';

type ModalHeaderProps = {
	title: string;
	subtitle: ReactNode;
};

export const ModalHeader = ( { title, subtitle }: ModalHeaderProps ) => {
	return (
		<Stack gap={ 0.75 }>
			<Typography variant="h4" color="text.primary" maxWidth={ 310 }>
				{ title }
			</Typography>
			<Typography variant="subtitle2" color="text.primary">
				{ subtitle }
			</Typography>
		</Stack>
	);
};
